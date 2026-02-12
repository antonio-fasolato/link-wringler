# Link Finder - Estensione Chrome

Un'estensione Chrome che trova tutti i link presenti in una selezione di testo sulla pagina e permette di aprirli o copiarli negli appunti.

## Funzionalità

- **Selezione del testo**: Seleziona una porzione di testo sulla pagina web
- **Menu contestuale doppio**: 
  - "Apri tutti i link nella selezione" - Apre tutti i link trovati in nuove schede
  - "Copia tutti i link nella selezione" - Copia tutti i link negli appunti (separati da newline)
- **Validazione**: Mostra un alert se non c'è selezione o se non ci sono link nella selezione

## Installazione

1. Scarica o clona questa repository
2. Apri Chrome e vai su `chrome://extensions/`
3. Attiva la "Modalità sviluppatore" nell'angolo in alto a destra
4. Clicca su "Carica estensione non pacchettizzata"
5. Seleziona la cartella del progetto `link-finder`

## Come usare

### Aprire i link

1. Naviga su qualsiasi pagina web
2. Seleziona una porzione di testo che contiene dei link
3. Clicca con il tasto destro sulla selezione
4. Seleziona "Apri tutti i link nella selezione" dal menu contestuale
5. Tutti i link verranno aperti in nuove schede

### Copiare i link negli appunti

1. Naviga su qualsiasi pagina web
2. Seleziona una porzione di testo che contiene dei link
3. Clicca con il tasto destro sulla selezione
4. Seleziona "Copia tutti i link nella selezione" dal menu contestuale
5. Tutti i link verranno copiati negli appunti, separati da newline (uno per riga)

## Nota sulle icone

Il file [`manifest.json`](manifest.json:12) richiede tre icone (16x16, 48x48, 128x128 pixel). Queste icone non sono incluse nel progetto. Per un funzionamento completo, puoi:

- Creare le tue icone personalizzate
- Rimuovere la sezione "icons" dal file manifest.json se vuoi utilizzare l'estensione senza icone

## Struttura del progetto

```
link-finder/
├── manifest.json    # Configurazione dell'estensione
├── background.js    # Gestione del menu contestuale
├── content.js       # Logica per trovare e aprire i link
└── README.md        # Questo file
```

## Tecnologie utilizzate

- Chrome Extensions Manifest V3
- JavaScript ES6+
- Chrome APIs (contextMenus, scripting, activeTab, clipboardWrite)
- Clipboard API (navigator.clipboard)

## Licenza

Questo progetto è open source e disponibile per uso personale e commerciale.
