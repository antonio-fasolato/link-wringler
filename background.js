// Creazione del menu contestuale quando l'estensione viene installata
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "linkFinder",
    title: "Apri tutti i link nella selezione",
    contexts: ["selection"]
  });
});

// Gestione del click sul menu contestuale
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "linkFinder") {
    // Invia un messaggio al content script per elaborare la selezione
    chrome.tabs.sendMessage(tab.id, {
      action: "findAndOpenLinks"
    });
  }
});
