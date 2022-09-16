import TranslateAPI from './background/translate-api';
import {
  STORAGE_AREA, DEFAULT_SETTING, CONTEXTMENU_TRANSLATE_ID, RUNTIME_EVENT_TYPE,
  LangCodeMapping, I18Ns
} from './common/constants';
import {
  storageGetP, storageSetP, getTranslateUri, getI18NMessage
} from './common/utils';

interface SettingsType {
  SOURCE_LANG: string;
  TARGET_LANG: string;
  ENABLE_API: boolean;
}

(async () => {

// TODO manifest V3 only support service worker in the root directory
const translateAPI = new TranslateAPI();

let contextMenu;
let contextMenuFrameId;

const settings = await storageGetP(STORAGE_AREA.SETTINGS, DEFAULT_SETTING);
const { TARGET_LANG, UI_LANG, UI_TAREGT_LANG_SAME } = settings;
const uiLang = UI_TAREGT_LANG_SAME ? TARGET_LANG : UI_LANG;
if (!contextMenu) {
  contextMenu = chrome.contextMenus.create({
    id: CONTEXTMENU_TRANSLATE_ID,
    title: getI18NMessage(I18Ns, uiLang, 'sw_context_translate'),
    contexts: ['selection']
  });
}

const translateInternal = async (text, sourceLang, targetLang, enableAPI) => {
  const translateRes = enableAPI
    ? await translateAPI.translate(text, sourceLang, targetLang, 'text')
    : await translateAPI.translateFree(encodeURIComponent(text), sourceLang, targetLang);
  return translateRes;
}

const sendMessageToCurrentTab = async (tabId: number, frameId: number, type, data = {}) => {
  const options:any = {};
  if (Number.isInteger(frameId)) {
    options.frameId = frameId;
  } else {
    options.frameId = 0;
  }
  if (tabId > -1) {
    return await chrome.tabs.sendMessage(tabId, {type, data}, options);
  } else {
    const tabs = await chrome.tabs.query({ currentWindow: true, active : true});
    if (tabs && tabs[0] && typeof tabs[0].id != 'undefined') {
      return await chrome.tabs.sendMessage(tabs[0].id, {type, data}, options);
    }
  }
}

const onTranslateClick = async (info, tab) => {
  contextMenuFrameId = info.frameId;
  let q = info.selectionText;
  if (q) {
    q = q.trim().toLowerCase();
    const settings = await storageGetP(STORAGE_AREA.SETTINGS, DEFAULT_SETTING);
    const {SOURCE_LANG, TARGET_LANG, ENABLE_API} = settings as unknown as SettingsType;
    try {
      await sendMessageToCurrentTab(tab.id, contextMenuFrameId, RUNTIME_EVENT_TYPE.LOAD_TRANSLATION);
      const translateRes = await translateInternal(q, SOURCE_LANG, TARGET_LANG, ENABLE_API);
      await sendMessageToCurrentTab(tab.id, contextMenuFrameId, RUNTIME_EVENT_TYPE.GET_TRANSLATION, translateRes);
    } catch (e) {
      console.log(`Error: ${e.message}`);
      const translateUrl = getTranslateUri('https://translate.google.com/', {
        sl: LangCodeMapping[SOURCE_LANG] ? LangCodeMapping[SOURCE_LANG] : SOURCE_LANG,
        tl: LangCodeMapping[TARGET_LANG] ? LangCodeMapping[TARGET_LANG] : TARGET_LANG,
        text: q
      });
      await sendMessageToCurrentTab(tab.id, contextMenuFrameId, RUNTIME_EVENT_TYPE.ERROR_TRANSLATION, {
        errMsg: e.message,
        url: translateUrl
      });
    }
  }
}

const addVocabularyToStorage = async (translateRes) => {
  const {originalText, translatedText, dictResult} = translateRes;
  const settings = await storageGetP(STORAGE_AREA.SETTINGS, DEFAULT_SETTING);
  const {SOURCE_LANG, TARGET_LANG} = settings;
  const vocabTranslateArea = `${SOURCE_LANG}-${TARGET_LANG}`;
  const vocabs = await storageGetP(STORAGE_AREA.VOCAB, {});
  const vocabsWithSetting = vocabs[vocabTranslateArea] || {};
  vocabsWithSetting[originalText] = {
    translation: translatedText,
    dict: dictResult,
    createdTime: Date.now()
  }
  vocabs[vocabTranslateArea] = vocabsWithSetting;
  await storageSetP(STORAGE_AREA.VOCAB, vocabs);
}

chrome.contextMenus.onClicked.addListener(onTranslateClick)

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const {type, data} = request;
  if (!type) {
    return;
  }
  switch (type) {
    case 'addToVocab': {
      addVocabularyToStorage(data);
      sendResponse('added');
      break;
    }
    case 'getI18NStrings': {
      sendResponse(I18Ns);
      break;
    }
    default:
      break;
  }
});

chrome.runtime.onInstalled.addListener(async (details) => {
  if (!details || details.reason != 'install') {
    return;
  }
  // user installed for the first time
  chrome.tabs.create({
    url: chrome.runtime.getURL('/pages/settings/index.html?install=new')
  });
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace != 'local') {
    return;
  }
  const changeKeys = Object.keys(changes);
  if (changeKeys.length != 1 || changeKeys[0] != STORAGE_AREA.SETTINGS) {
    return;
  }
  // settings changed
  const newValue = changes[STORAGE_AREA.SETTINGS].newValue
  if (!newValue || !newValue.TARGET_LANG) {
    return;
  }
  const { TARGET_LANG, UI_LANG, UI_TAREGT_LANG_SAME } = newValue;
  const uiLang = UI_TAREGT_LANG_SAME ? TARGET_LANG : UI_LANG;
  const contextTranslateTitle = getI18NMessage(I18Ns, uiLang, 'sw_context_translate');
  chrome.contextMenus.update(CONTEXTMENU_TRANSLATE_ID, {title: contextTranslateTitle}, () => {
    console.log(`context translate menu title updated as ${contextTranslateTitle}`);
  });
});

chrome.webNavigation.onDOMContentLoaded.addListener(async (details) => {
  const frameIds = [details.frameId];
  // run custom elements polyfill
  await chrome.scripting.executeScript({
    target: {tabId: details.tabId, frameIds: frameIds},
    files: [ 'common/lib/custom-elements-1.5.0.min.js' ]
  });
  await chrome.scripting.executeScript({
    target: {tabId: details.tabId, frameIds: frameIds},
    files: [ 'content/content.js' ]
  });
});

})();
