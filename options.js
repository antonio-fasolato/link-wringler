// Function to localize the page
const localizePage = () => {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const messageKey = el.getAttribute('data-i18n');
    const message = chrome.i18n.getMessage(messageKey);
    if (message) {
      // If it's an input/button, you might want to change 'value', 
      // but for labels/headers, textContent is perfect.
      el.textContent = message;
    }
  });
};

// Saves options to chrome.storage
const saveOptions = () => {
  const extractPlainText = document.getElementById('extractPlainText').checked;
  const lessStrictRegex = document.getElementById('lessStrictRegex').checked;

  chrome.storage.sync.set(
    { extractPlainText, lessStrictRegex },
    () => {
      const status = document.getElementById('status');
      status.textContent = chrome.i18n.getMessage("settingsSaved");;
      setTimeout(() => { status.textContent = ''; }, 1000);
    }
  );
};

// Restores checkbox state using the preferences stored in chrome.storage.
const restoreOptions = () => {
  chrome.storage.sync.get(
    { extractPlainText: true, lessStrictRegex: false }, // Default values
    (items) => {
      document.getElementById('extractPlainText').checked = items.extractPlainText;
      document.getElementById('lessStrictRegex').checked = items.lessStrictRegex;
    }
  );
};

document.addEventListener('DOMContentLoaded', () => {
  localizePage();
  restoreOptions();
});
document.getElementById('extractPlainText').addEventListener('change', saveOptions);
document.getElementById('lessStrictRegex').addEventListener('change', saveOptions);