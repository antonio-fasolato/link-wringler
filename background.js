// Creazione dei menu contestuali quando l'estensione viene installata
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "linkWringer",
    title: chrome.i18n.getMessage("contextMenuOpenLinks"), 
    contexts: ["selection"]
  });
  
  chrome.contextMenus.create({
    id: "linkCopier",
    title: chrome.i18n.getMessage("contextMenuCopyLinks"),
    contexts: ["selection"]
  });
});

// Gestione del click sui menu contestuali
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "linkWringer") {
    // Invia un messaggio al content script per aprire i link
    chrome.tabs.sendMessage(tab.id, {
      action: "findAndOpenLinks"
    });
  } else if (info.menuItemId === "linkCopier") {
    // Invia un messaggio al content script per copiare i link
    chrome.tabs.sendMessage(tab.id, {
      action: "findAndCopyLinks"
    });
  }
});