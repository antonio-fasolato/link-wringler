// Saves options to chrome.storage
const saveOptions = () => {
  const extractPlainText = document.getElementById('extractPlainText').checked;
  const lessStrictRegex = document.getElementById('lessStrictRegex').checked;

  chrome.storage.sync.set(
    { extractPlainText, lessStrictRegex },
    () => {
      const status = document.getElementById('status');
      status.textContent = 'Settings saved.';
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

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('extractPlainText').addEventListener('change', saveOptions);
document.getElementById('lessStrictRegex').addEventListener('change', saveOptions);