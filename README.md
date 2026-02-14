# 🧽🔗 Link Wringer

**Effortlessly extract, open, and manage URLs from any text selection.**

Link Wringer is a lightweight, privacy-focused Chrome extension designed for power users. Whether you are dealing with properly formatted HTML links or raw text URLs (like `example.com`), this tool helps you process them in bulk with a single click.

---

## 🚀 Features

* **Smart Extraction**: Scans your selection for both `<a>` tags and plain-text URLs using advanced Regex.
* **Bulk Open**: Open every discovered link in a new background tab instantly.
* **Bulk Copy**: Clean and extract URLs directly to your clipboard, formatted as a tidy list.
* **Customizable Settings**: Use the Options page to toggle plain-text extraction or adjust Regex strictness for better accuracy.
* **Internationalized**: Full support for English and Italian locales.

---

## 🛠️ Installation

### Developer Mode (Manual)

1. **Clone/Download** this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **"Developer mode"** using the toggle in the top-right corner.
4. Click **"Load unpacked"** and select the `link-wringer` project folder.

---

## 📖 How to Use

1. **Select**: Highlight any portion of text on a webpage.
2. **Right-Click**: Open the context menu on your selection.
3. **Choose Action**:
* **Open Links**: Launches all URLs into new tabs.
* **Copy Links**: Copies a newline-separated list of URLs to your clipboard.


4. **Configure**: Right-click the extension icon and select **Options** to customize link detection behavior.

---

## 📁 Project Structure

```text
link-wringer/
├── _locales/       # Translation files (EN, IT)
├── manifest.json   # Extension configuration & permissions
├── background.js   # Context menu creation & event handling
├── content.js      # Link extraction logic & DOM interaction
├── options.html    # Settings UI
├── options.js      # Settings logic & storage management
└── README.md       # Project documentation

```

---

## 🔒 Permissions & Privacy

This extension is built with the **Manifest V3** standard, prioritizing security and performance. It uses the following permissions:

* `contextMenus`: To add "Open" and "Copy" actions to your right-click menu.
* `activeTab`: To access the selection on your currently active page.
* `scripting`: To execute the extraction logic.
* `storage`: To save your custom preferences.
* `clipboardWrite`: To save extracted links to your clipboard.

**Privacy Note:** Link Wringer works entirely locally. No browsing data, selections, or URLs are ever collected, stored, or transmitted to external servers.

---

## 📄 License

This project is open-source and available under the **MIT License**. Feel free to use, modify, and distribute it for personal or commercial projects.

---

### Next Step

Since your `README.md` mentions that icons are missing, would you like me to generate a prompt you can use in an AI image generator to create the **16x16**, **48x48**, and **128x128** icons in a consistent style?