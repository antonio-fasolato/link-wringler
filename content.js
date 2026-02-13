// Listener per i messaggi dal background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "findAndOpenLinks") {
    findAndOpenLinks();
  } else if (request.action === "findAndCopyLinks") {
    findAndCopyLinks();
  }
});

function extractTextualLinks(selectedText) {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  const foundUrls = selectedText.match(urlRegex);
  const cleanUrls = foundUrls ? foundUrls.map(url => url.replace(/[.,;]$/, "")) : [];
  console.log(`Links extracted from the plain text: ${cleanUrls}`);
  return cleanUrls;
}

function findAndOpenLinks() {
  const selection = window.getSelection();
  
  if (!selection || selection.toString().trim() === "") {
    // Use "noTextSelected" key
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

  const urlsFromText = extractTextualLinks(selection.toString().trim());
  const allUrls = [...urls, ...urlsFromText];

  if (allUrls.length === 0) {
    // Use "noValidLinksFound" key
    alert(chrome.i18n.getMessage("noValidLinksFound"));
    return;
  }
  
  allUrls.forEach(url => {
    window.open(url, "_blank");
  });
  
  console.log(`Link Finder: ${allUrls.length} link aperti.`);
}

function findAndCopyLinks() {
  const selection = window.getSelection();
  
  if (!selection || selection.toString().trim() === "") {
    alert(chrome.i18n.getMessage("noTextSelected"));
    return;
  }

  const range = selection.getRangeAt(0);
  const container = document.createElement("div");
  container.appendChild(range.cloneContents());
  
  const links = container.querySelectorAll("a[href]");
  
  if (links.length === 0) {
    alert(chrome.i18n.getMessage("noLinksFound"));
    return;
  }
  
  const urls = new Set();
  links.forEach(link => {
    const href = link.href;
    if (href && !href.startsWith("#") && !href.startsWith("javascript:")) {
      urls.add(href);
    }
  });

  const urlsFromText = extractTextualLinks(selection.toString().trim());

  const allUrls = [...urls, ...urlsFromText];

  if (allUrls.size === 0) {
    alert(chrome.i18n.getMessage("noValidLinksFound"));
    return;
  }
  
  const linksText = Array.from(allUrls).join("\n");

  navigator.clipboard.writeText(linksText).then(() => {
    // Pass the count to the "linksCopied" placeholder
    const successMsg = chrome.i18n.getMessage("linksCopied", [allUrls.length.toString()]);
    alert(successMsg);
    console.log(`Link Finder: ${successMsg}`);
  }).catch(err => {
    console.error("Error:", err);
    // Use "copyError" key
    alert(chrome.i18n.getMessage("copyError"));
  });
}
