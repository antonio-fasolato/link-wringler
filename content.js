// Listener per i messaggi dal background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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

async function extractTextualLinks(selectedText) {
  const settings = await getSettings();
  
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

async function findAndOpenLinks() {
  const selection = window.getSelection();
  if (!selection || selection.toString().trim() === "") {
    alert(chrome.i18n.getMessage("noTextSelected"));
    return;
  }
  
  const range = selection.getRangeAt(0);
  const container = document.createElement("div");
  container.appendChild(range.cloneContents());
  
  const links = container.querySelectorAll("a[href]");
  const urls = new Set();
  links.forEach(link => {
    const href = link.href;
    if (href && !href.startsWith("#") && !href.startsWith("javascript:")) {
      urls.add(href);
    }
  });

  const urlsFromText = await extractTextualLinks(selection.toString().trim());
  const allUrls = [...new Set([...urls, ...urlsFromText])];

  if (allUrls.length === 0) {
    alert(chrome.i18n.getMessage("noValidLinksFound"));
    return;
  }
  
  allUrls.forEach(url => {
    // Basic normalization for strings found via regex without protocol
    const validUrl = url.toLowerCase().startsWith('http') ? url : `https://${url}`;
    window.open(validUrl, "_blank");
  });
}

async function findAndCopyLinks() {
  const selection = window.getSelection();
  
  if (!selection || selection.toString().trim() === "") {
    alert(chrome.i18n.getMessage("noTextSelected"));
    return;
  }

  // 1. Extract links from <a> tags
  const range = selection.getRangeAt(0);
  const container = document.createElement("div");
  container.appendChild(range.cloneContents());
  const linkTags = container.querySelectorAll("a[href]");
  
  const tagUrls = new Set();
  linkTags.forEach(link => {
    const href = link.href;
    if (href && !href.startsWith("#") && !href.startsWith("javascript:")) {
      tagUrls.add(href);
    }
  });

  // 2. Extract links from plain text (Respects your 2 new checkboxes)
  const textualUrls = await extractTextualLinks(selection.toString().trim());

  // 3. Merge and Normalize
  // Ensure we don't have duplicates and add https:// to naked domains from regex
  const finalUrls = new Set([...tagUrls]);
  textualUrls.forEach(url => {
    const normalized = url.toLowerCase().startsWith('http') ? url : `https://${url}`;
    finalUrls.add(normalized);
  });

  if (finalUrls.size === 0) {
    alert(chrome.i18n.getMessage("noValidLinksFound"));
    return;
  }
  
  const linksText = Array.from(finalUrls).join("\n");

  // 4. Copy to clipboard
  navigator.clipboard.writeText(linksText).then(() => {
    const successMsg = chrome.i18n.getMessage("linksCopied", [finalUrls.size.toString()]);
    alert(successMsg);
  }).catch(err => {
    console.error("Error:", err);
    alert(chrome.i18n.getMessage("copyError"));
  });
}
