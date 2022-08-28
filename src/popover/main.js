(async () => {

const settings = await storageGetP(STORAGE_AREA.SETTINGS, DEFAULT_SETTING);
const { TARGET_LANG, UI_LANG, UI_TAREGT_LANG_SAME } = settings;
const uiLang = UI_TAREGT_LANG_SAME ? TARGET_LANG : UI_LANG;

const viewVocabBtn = document.getElementById('view-vocab');
const settingsBtn = document.getElementById('settings');
const statBtn = document.getElementById('stat');
const versionE = document.getElementById('ext-version');

viewVocabBtn.textContent = getI18NMessage(uiLang, 'popover_refresh_memory');
viewVocabBtn.title = getI18NMessage(uiLang, 'popover_view_your_vocab');
settingsBtn.title = getI18NMessage(uiLang, 'popover_settings');
statBtn.title = getI18NMessage(uiLang, 'popover_statistics');

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

statBtn.addEventListener('click', () => {
  const url = chrome.runtime.getURL('/pages/statistics/index.html');
  chrome.tabs.create({url});
  window.close();
});

versionE.textContent = chrome.runtime.getManifest().version;

})();
