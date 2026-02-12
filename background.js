// Creazione dei menu contestuali quando l'estensione viene installata
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "linkFinder",
    title: "Apri tutti i link nella selezione",
    contexts: ["selection"]
  });
  
  chrome.contextMenus.create({
    id: "linkCopier",
    title: "Copia tutti i link nella selezione",
    contexts: ["selection"]
  });
});

// Gestione del click sui menu contestuali
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "linkFinder") {
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
