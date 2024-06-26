import TranslateAPI from './background/translate-api';
import {
  STORAGE_AREA, DEFAULT_SETTING, CONTEXTMENU_TRANSLATE_ID, RUNTIME_EVENT_TYPE,
  LangCodeMapping, I18Ns, DEFAULT_USAGE
} from './common/constants';
import {
  storageGetP, storageSetP, getTranslateUri, getI18NMessage, debounce, compareVersion, setBadge
} from './common/utils';
import { SettingsType } from './types';
import {compress, decompress} from 'lz-string';

(async () => {

// TODO manifest V3 only support service worker in the root directory
const translateAPI = new TranslateAPI();

let contextMenuFrameId;

const settings = await storageGetP(STORAGE_AREA.SETTINGS, DEFAULT_SETTING);
const { TARGET_LANG, UI_LANG, UI_TAREGT_LANG_SAME } = settings;
const uiLang = UI_TAREGT_LANG_SAME ? TARGET_LANG : UI_LANG;

const usage = await storageGetP(STORAGE_AREA.USAGE, DEFAULT_USAGE);
const { VERSION_SEEN } = usage;
const currentVersion = chrome.runtime.getManifest().version;
if (compareVersion(VERSION_SEEN as string, currentVersion) < 0) {
  // set badge
  setBadge('\u2736', '#068DA9', '#FFD95A');
}

chrome.contextMenus.create({
  id: CONTEXTMENU_TRANSLATE_ID,
  title: getI18NMessage(I18Ns, uiLang, 'sw_context_translate'),
  contexts: ['selection']
}, () => {
  if (chrome.runtime.lastError) {
    console.log(`Warning when creating context menu: ${chrome.runtime.lastError.message}`);
  }
});


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
  if (tabId < 0) {
    const tabs = await chrome.tabs.query({ currentWindow: true, active : true});
    tabId = tabs[0].id;
  }
  const promise = new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, {type, data}, options, resp => {
      if(chrome.runtime.lastError) {
        reject(chrome.runtime.lastError.message);
      } else {
        resolve(resp);
      }
    });
  });
  return promise;
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
    case 'SYN': {
      sendResponse('SYN-ACK');
      break;
    }
    default:
      break;
  }
});

let omniAddText = ` + ${getI18NMessage(I18Ns, uiLang, 'omni_add')}`;

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
  if (!newValue) {
    return;
  }
  const { TARGET_LANG, UI_LANG, UI_TAREGT_LANG_SAME, ENABLE_SIDEBAR } = newValue;
  if (TARGET_LANG) {
    const uiLang = UI_TAREGT_LANG_SAME ? TARGET_LANG : UI_LANG;
    const contextTranslateTitle = getI18NMessage(I18Ns, uiLang, 'sw_context_translate');
    chrome.contextMenus.update(CONTEXTMENU_TRANSLATE_ID, {title: contextTranslateTitle}, () => {
      console.log(`context translate menu title updated as ${contextTranslateTitle}`);
    });
    omniAddText = ` + ${getI18NMessage(I18Ns, uiLang, 'omni_add')}`;
  }
  if (ENABLE_SIDEBAR) {
    (chrome as any).sidePanel.setOptions({
      enabled: true,
      path: 'pages/side-panel/index.html'
    });
  } else {
    (chrome as any).sidePanel.setOptions({
      enabled: false
    })
  }
});

let translateRes;

const omniboxInputChangeHandler = async (text, suggest) => {
  text = text.trim();
  if (!text) {
    return;
  }
  const suggestions = [];
  const settings = await storageGetP(STORAGE_AREA.SETTINGS, DEFAULT_SETTING);
  const {SOURCE_LANG, TARGET_LANG} = settings as unknown as SettingsType;
  try {
    translateRes = await translateAPI.translateFree(encodeURIComponent(text), SOURCE_LANG, TARGET_LANG);
    // build suggestions
    if (translateRes.translatedText) {
      suggestions.push({
        content: `${text}: ${translateRes.translatedText}`,
        deletable: false,
        description: `${text}: ${translateRes.translatedText}`
      });
    }
    if (translateRes.dictResult && translateRes.dictResult.length > 0) {
      const dictResults = translateRes.dictResult.slice(0, 3); // use 3 dict at most
      dictResults.forEach(dict => {
        if (!dict.pos || !dict.terms || dict.terms.length === 0) {
          return;
        }
        suggestions.push({
          content: `${dict.pos}: ${dict.terms.join(', ')}`,
          deletable: false,
          description: `${dict.pos}: ${dict.terms.join(', ')}`
        });
      });
    }
    if (translateRes.exampleRes && translateRes.exampleRes.length > 0) {
      const exampleRes = translateRes.exampleRes.slice(0, 2); // use 2 examples at most
      exampleRes.forEach(example => {
        const exampleText = (example.text || '').replace(/<\/{0,1}b>/g, '');
        if (!exampleText) {
          return;
        }
        suggestions.push({
          content: exampleText,
          deletable: false,
          description: exampleText
        });
      });
    }
    // push an add button
    suggestions.push({
      content: omniAddText,
      deletable: false,
      description: `<match>${omniAddText}</match>`
    });
  } catch (e) {
    suggestions.push({
      content: text,
      deletable: false,
      description: `Error: ${e}`
    });
  }
  suggest(suggestions);
}

const omniboxInputEnterHandler = async (text, disposition) => {
  if (text && text.startsWith(' + ') && translateRes) {
    addVocabularyToStorage(translateRes);
  }
}

chrome.omnibox.onInputChanged.addListener(debounce(omniboxInputChangeHandler, 500));
chrome.omnibox.onInputEntered.addListener(omniboxInputEnterHandler);

(chrome as any).sidePanel.setPanelBehavior({openPanelOnActionClick: false});
(chrome as any).sidePanel.setOptions({
  enabled: true,
  path: 'pages/side-panel/index.html'
});


const allData = await chrome.storage.local.get();
const allDataStr = JSON.stringify(allData);

const compressed = compress(allDataStr);
console.log(allDataStr.length, compressed.length);

})();

// onInstalled event only triggered when the registeration is called sync in the first place.
chrome.runtime.onInstalled.addListener(details => {
  if (!details) {
    return;
  }
  if (details.reason === 'install') {
    // user installed for the first time
    chrome.tabs.create({
      url: chrome.runtime.getURL('/pages/settings/index.html?install=new')
    });
    return;
  }
  if (details.reason === 'update') {
    // extension updated
    storageGetP(STORAGE_AREA.USAGE, DEFAULT_USAGE)
    .then(usage => {
      const { VERSION_SEEN } = usage;
      const currentVersion = chrome.runtime.getManifest().version;
      if (compareVersion(VERSION_SEEN as string, currentVersion) < 0) {
        // set badge
        setBadge('\u2736', '#068DA9', '#FFD95A');
      }
    });
  }
});
