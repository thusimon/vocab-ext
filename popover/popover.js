const viewVocabBtn = document.getElementById('view-vocab');
const settingsBtn = document.getElementById('settings');
const versionE = document.getElementById('ext-version');

viewVocabBtn.addEventListener('click', () => {
  const url = chrome.runtime.getURL('/pages/view-vocabulary/index.html');
  chrome.tabs.create({url});
  window.close();
});

settingsBtn.addEventListener('click', () => {
  const url = chrome.runtime.getURL('/pages/settings/index.html');
  chrome.tabs.create({url});
  window.close();
});

versionE.textContent = chrome.runtime.getManifest().version