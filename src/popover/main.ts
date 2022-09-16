import {
  STORAGE_AREA, DEFAULT_SETTING
} from '../common/constants';
import { storageGetP, getI18NMessage } from '../common/utils';


(async () => {

const settings = await storageGetP(STORAGE_AREA.SETTINGS, DEFAULT_SETTING);
const { TARGET_LANG, UI_LANG, UI_TAREGT_LANG_SAME } = settings;
const uiLang = (UI_TAREGT_LANG_SAME ? TARGET_LANG : UI_LANG) as string;

let I18Ns: {[key: string]: any};
// due to service-worker inactive after 5min, use try catch to make sure the data is obtained
try {
  I18Ns = await chrome.runtime.sendMessage({type: 'getI18NStrings'});
} catch(e) {
  I18Ns = await chrome.runtime.sendMessage({type: 'getI18NStrings'});
}

const viewVocabBtn = document.getElementById('view-vocab') as HTMLElement;
const settingsBtn = document.getElementById('settings') as HTMLElement;
const statBtn = document.getElementById('stat') as HTMLElement;
const versionE = document.getElementById('ext-version') as HTMLElement;

viewVocabBtn.textContent = getI18NMessage(I18Ns, uiLang, 'popover_refresh_memory');
viewVocabBtn.title = getI18NMessage(I18Ns, uiLang, 'popover_view_your_vocab');
settingsBtn.title = getI18NMessage(I18Ns, uiLang, 'popover_settings');
statBtn.title = getI18NMessage(I18Ns, uiLang, 'popover_statistics');

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
