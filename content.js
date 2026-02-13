// Listener per i messaggi dal background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "findAndOpenLinks") {
    findAndOpenLinks();
  } else if (request.action === "findAndCopyLinks") {
    findAndCopyLinks();
  }
});

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
  
  if (links.length === 0) {
    // Use "noLinksFound" key
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
  
  if (urls.size === 0) {
    // Use "noValidLinksFound" key
    alert(chrome.i18n.getMessage("noValidLinksFound"));
    return;
  }
  
  urls.forEach(url => {
    window.open(url, "_blank");
  });
  
  console.log(`Link Finder: ${urls.size} link aperti.`);
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
  
  if (urls.size === 0) {
    alert(chrome.i18n.getMessage("noValidLinksFound"));
    return;
  }
  
  const linksText = Array.from(urls).join("\n");
  
  navigator.clipboard.writeText(linksText).then(() => {
    // Pass the count to the "linksCopied" placeholder
    const successMsg = chrome.i18n.getMessage("linksCopied", [urls.size.toString()]);
    alert(successMsg);
    console.log(`Link Finder: ${successMsg}`);
  }).catch(err => {
    console.error("Error:", err);
    // Use "copyError" key
    alert(chrome.i18n.getMessage("copyError"));
  });
}