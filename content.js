// Listener per i messaggi dal background script
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "findAndOpenLinks") {
    findAndOpenLinks();
  } else if (request.action === "findAndCopyLinks") {
    findAndCopyLinks();
  }
});

// Helper to get settings
async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get({
      extractPlainText: true,
      lessStrictRegex: false
    }, (items) => resolve(items));
  });
}

function extractTextualLinks(selectedText, settings) {
  if (!settings.extractPlainText) return [];

  // Strict: Needs protocol or www.
  // Less Strict: Matches anything that looks like a domain (e.g., example.com)
  const strictRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  const lessStrictRegex = /(([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}|https?:\/\/[^\s]+)/gi;
  
  const activeRegex = settings.lessStrictRegex ? lessStrictRegex : strictRegex;
  
  const foundUrls = selectedText.match(activeRegex);
  const cleanUrls = foundUrls ? foundUrls.map(url => url.replace(/[.,;]$/, "")) : [];
  
  return cleanUrls;
}

function getPageSelection() {
  const selection = window.getSelection();
  const text = selection?.toString().trim();
  if (!text || !selection.rangeCount) return null;

  return { text, range: selection.getRangeAt(0).cloneRange() };
}

function extractAnchorLinks(range) {
  const urls = new Set();
  const addLink = (link) => {
    const href = link.href;
    if (href && !href.startsWith("#") && !href.startsWith("javascript:")) {
      urls.add(href);
    }
  };

  // A range wholly inside a link does not include that link in cloneContents().
  const ancestor = range.commonAncestorContainer;
  const element = ancestor.nodeType === Node.ELEMENT_NODE ? ancestor : ancestor.parentElement;
  const enclosingLink = element?.closest("a[href]");
  if (enclosingLink) addLink(enclosingLink);

  range.cloneContents().querySelectorAll("a[href]").forEach(addLink);
  return urls;
}

function normalizeUrl(url) {
  return url.toLowerCase().startsWith("http") ? url : `https://${url}`;
}

function extractSelectionLinks(selection, settings) {
  return {
    anchorUrls: extractAnchorLinks(selection.range),
    textualUrls: extractTextualLinks(selection.text, settings)
  };
}

async function findAndOpenLinks(selection = getPageSelection()) {
  if (!selection) {
    alert(chrome.i18n.getMessage("noTextSelected"));
    return;
  }

  const { anchorUrls, textualUrls } = extractSelectionLinks(selection, await getSettings());
  const allUrls = new Set([...anchorUrls, ...textualUrls].map(normalizeUrl));

  if (allUrls.size === 0) {
    alert(chrome.i18n.getMessage("noValidLinksFound"));
    return;
  }

  allUrls.forEach(url => window.open(url, "_blank", "noopener"));
}

async function findAndCopyLinks(selection = getPageSelection()) {
  if (!selection) {
    alert(chrome.i18n.getMessage("noTextSelected"));
    return;
  }

  const { anchorUrls, textualUrls } = extractSelectionLinks(selection, await getSettings());
  const urls = new Set([...anchorUrls, ...textualUrls.map(normalizeUrl)]);

  if (urls.size === 0) {
    alert(chrome.i18n.getMessage("noValidLinksFound"));
    return;
  }

  try {
    await navigator.clipboard.writeText([...urls].join("\n"));
    alert(chrome.i18n.getMessage("linksCopied", [urls.size.toString()]));
  } catch (error) {
    console.error("Error:", error);
    alert(chrome.i18n.getMessage("copyError"));
  }
}

function initSelectionActions() {
  const host = document.createElement("link-wringer-actions");
  const shadow = host.attachShadow({ mode: "closed" });
  const styles = new CSSStyleSheet();
  styles.replaceSync(`
    :host {
      all: initial;
      position: fixed;
      z-index: 2147483647;
      display: flex;
      gap: 2px;
      padding: 3px;
      border: 1px solid #475569;
      border-radius: 9px;
      background: #172033;
      box-shadow: 0 3px 10px #0004;
      color: #fff;
      direction: ltr;
      user-select: none;
    }
    :host([hidden]) { display: none !important; }
    button {
      display: grid;
      place-items: center;
      width: 32px;
      height: 32px;
      padding: 0;
      border: 0;
      border-radius: 5px;
      background: transparent;
      color: inherit;
      cursor: pointer;
    }
    button:hover { background: #334155; }
    button:focus-visible { outline: 2px solid #93c5fd; outline-offset: -2px; }
    .icon {
      position: relative;
      display: block;
      width: 16px;
      height: 16px;
      pointer-events: none;
    }
    .icon::before, .icon::after {
      position: absolute;
      box-sizing: border-box;
    }
    .copy::before, .copy::after {
      content: "";
      width: 10px;
      height: 12px;
      border: 1.5px solid currentColor;
      border-radius: 2px;
    }
    .copy::before { top: 0; left: 1px; }
    .copy::after { bottom: 0; right: 1px; background: #172033; }
    button:hover .copy::after { background: #334155; }
    .open::before {
      content: "";
      bottom: 0;
      left: 0;
      width: 12px;
      height: 12px;
      border: 1.5px solid currentColor;
      border-radius: 2px;
      clip-path: polygon(0 0, 45% 0, 45% 45%, 100% 45%, 100% 100%, 0 100%);
    }
    .open::after {
      content: "↗";
      top: -5px;
      right: -2px;
      font: bold 18px/1 system-ui, sans-serif;
    }
  `);
  shadow.adoptedStyleSheets = [styles];
  host.hidden = true;

  let savedSelection = null;
  let settings = null;
  let settingsVersion = 0;
  let needsLinkCheck = true;
  let hasLinks = false;
  let selecting = false;
  let frame = 0;

  function addButton(message, iconClass, action) {
    const button = document.createElement("button");
    const label = chrome.i18n.getMessage(message);
    button.type = "button";
    button.title = label;
    button.setAttribute("aria-label", label);

    const icon = document.createElement("span");
    icon.className = `icon ${iconClass}`;
    icon.setAttribute("aria-hidden", "true");
    button.append(icon);
    button.addEventListener("click", event => {
      event.stopPropagation();
      if (event.isTrusted && hasLinks && !needsLinkCheck && settings) action(savedSelection);
    });
    shadow.append(button);
  }

  addButton("contextMenuCopyLinks", "copy", findAndCopyLinks);
  addButton("contextMenuOpenLinks", "open", findAndOpenLinks);

  function updateToolbar() {
    frame = 0;
    if (selecting || !settings) {
      host.hidden = true;
      return;
    }

    if (needsLinkCheck) {
      needsLinkCheck = false;
      const selection = getPageSelection();
      // Tabbing into the buttons can collapse the page's live selection.
      if (selection || !shadow.activeElement) savedSelection = selection;

      hasLinks = false;
      if (savedSelection) {
        const { anchorUrls, textualUrls } = extractSelectionLinks(savedSelection, settings);
        hasLinks = anchorUrls.size > 0 || textualUrls.length > 0;
      }
    }

    if (!hasLinks) {
      host.hidden = true;
      return;
    }

    const rect = savedSelection.range.getBoundingClientRect();
    const { clientWidth, clientHeight } = document.documentElement;
    if (rect.width === 0 || rect.height === 0 || rect.bottom <= 0 ||
        rect.top >= clientHeight || rect.right <= 0 || rect.left >= clientWidth) {
      host.hidden = true;
      return;
    }

    if (!host.isConnected) document.body.append(host);
    host.hidden = false;
    const { width, height } = host.getBoundingClientRect();
    const gap = 6;
    const above = rect.top - height - gap;
    const below = rect.bottom + gap;
    const top = above >= gap || below + height > clientHeight - gap ? above : below;
    host.style.left = `${Math.max(gap, Math.min(rect.right - width, clientWidth - width - gap))}px`;
    host.style.top = `${Math.max(gap, Math.min(top, clientHeight - height - gap))}px`;
  }

  function scheduleUpdate() {
    if (!frame) frame = requestAnimationFrame(updateToolbar);
  }

  function scheduleLinkCheck() {
    needsLinkCheck = true;
    scheduleUpdate();
  }

  async function refreshSettings() {
    const version = ++settingsVersion;
    settings = null;
    host.hidden = true;
    const currentSettings = await getSettings();
    if (version !== settingsVersion) return;

    settings = currentSettings;
    scheduleLinkCheck();
  }

  window.addEventListener("pointerdown", event => {
    if (event.button === 0 && event.target !== host) {
      selecting = true;
      scheduleUpdate();
    }
  }, true);

  function endSelection() {
    if (!selecting) return;
    selecting = false;
    scheduleLinkCheck();
  }

  // Prevent a mouse click on the toolbar from clearing the selection.
  shadow.addEventListener("mousedown", event => event.preventDefault());
  shadow.addEventListener("focusout", scheduleLinkCheck);
  window.addEventListener("pointerup", endSelection, true);
  window.addEventListener("pointercancel", endSelection, true);
  window.addEventListener("blur", endSelection);
  window.addEventListener("scroll", scheduleUpdate, { capture: true, passive: true });
  window.addEventListener("resize", scheduleUpdate);
  document.addEventListener("selectionchange", scheduleLinkCheck);
  chrome.storage.sync.onChanged.addListener(changes => {
    if (changes.extractPlainText || changes.lessStrictRegex) refreshSettings();
  });
  refreshSettings();
}

if (document.body) initSelectionActions();
