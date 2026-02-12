// Listener per i messaggi dal background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "findAndOpenLinks") {
    findAndOpenLinks();
  } else if (request.action === "findAndCopyLinks") {
    findAndCopyLinks();
  }
});

function findAndOpenLinks() {
  // Ottieni la selezione corrente
  const selection = window.getSelection();
  
  // Controlla se c'è una selezione
  if (!selection || selection.toString().trim() === "") {
    alert("Nessun testo selezionato. Per favore, seleziona una porzione della pagina che contiene link.");
    return;
  }
  
  // Ottieni il range della selezione
  const range = selection.getRangeAt(0);
  
  // Crea un contenitore temporaneo per la selezione
  const container = document.createElement("div");
  container.appendChild(range.cloneContents());
  
  // Trova tutti i tag <a> nella selezione
  const links = container.querySelectorAll("a[href]");
  
  // Controlla se ci sono link
  if (links.length === 0) {
    alert("Nessun link trovato nella selezione.");
    return;
  }
  
  // Raccogli tutti gli URL unici
  const urls = new Set();
  links.forEach(link => {
    const href = link.href;
    // Salta i link vuoti, anchor e javascript
    if (href && !href.startsWith("#") && !href.startsWith("javascript:")) {
      urls.add(href);
    }
  });
  
  // Controlla se ci sono URL validi
  if (urls.size === 0) {
    alert("Nessun link valido trovato nella selezione.");
    return;
  }
  
  // Apri ogni URL in una nuova scheda
  urls.forEach(url => {
    window.open(url, "_blank");
  });
  
  // Mostra un messaggio di conferma
  console.log(`Link Finder: ${urls.size} link aperti in nuove schede.`);
}

function findAndCopyLinks() {
  // Ottieni la selezione corrente
  const selection = window.getSelection();
  
  // Controlla se c'è una selezione
  if (!selection || selection.toString().trim() === "") {
    alert("Nessun testo selezionato. Per favore, seleziona una porzione della pagina che contiene link.");
    return;
  }
  
  // Ottieni il range della selezione
  const range = selection.getRangeAt(0);
  
  // Crea un contenitore temporaneo per la selezione
  const container = document.createElement("div");
  container.appendChild(range.cloneContents());
  
  // Trova tutti i tag <a> nella selezione
  const links = container.querySelectorAll("a[href]");
  
  // Controlla se ci sono link
  if (links.length === 0) {
    alert("Nessun link trovato nella selezione.");
    return;
  }
  
  // Raccogli tutti gli URL unici
  const urls = new Set();
  links.forEach(link => {
    const href = link.href;
    // Salta i link vuoti, anchor e javascript
    if (href && !href.startsWith("#") && !href.startsWith("javascript:")) {
      urls.add(href);
    }
  });
  
  // Controlla se ci sono URL validi
  if (urls.size === 0) {
    alert("Nessun link valido trovato nella selezione.");
    return;
  }
  
  // Crea una stringa con tutti i link separati da newline
  const linksText = Array.from(urls).join("\n");
  
  // Copia negli appunti
  navigator.clipboard.writeText(linksText).then(() => {
    // Mostra un messaggio di conferma
    alert(`${urls.size} link copiati negli appunti.`);
    console.log(`Link Finder: ${urls.size} link copiati negli appunti.`);
  }).catch(err => {
    console.error("Errore durante la copia negli appunti:", err);
    alert("Errore durante la copia negli appunti.");
  });
}
