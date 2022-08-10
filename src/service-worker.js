importScripts('common/constants.js', 'common/utils.js', 'background/translate-api.js');

// TODO manifest V3 only support service worker in the root directory
const translateAPI = new TranslateAPI();

let contextMenu = null
  , contextMenuTabId
  , contextMenuFrameId;

if (!contextMenu) {
  contextMenu = chrome.contextMenus.create({
    id: CONTEXTMENU_TRANSLATE_ID,
    title: 'Translate the selected text',
    contexts: ['selection']
  });
}

const translateInternal = async (text, sourceLang, targetLang, enableAPI) => {
  const translateRes = enableAPI ? await translateAPI.translate(text, sourceLang, targetLang, 'text') :
        await translateAPI.translateFree(encodeURIComponent(text), sourceLang, targetLang, 'text');
  return translateRes;
}

const sendMessageToCurrentTab = async (tabId, frameId, type, data) => {
  const options = {};
  if (Number.isInteger(frameId)) {
    options.frameId = frameId;
  } else {
    options.frameId = 0;
  }
  if (tabId > -1) {
    return await chrome.tabs.sendMessage(tabId, {type, data}, options);
  } else {
    const tabs = await chrome.tabs.query({ currentWindow: true, active : true});
    if (tabs && tabs[0]) {
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
    const {SOURCE_LANG, TARGET_LANG, ENABLE_API} = settings;
    try {
      await sendMessageToCurrentTab(tab.id, contextMenuFrameId, RUNTIME_EVENT_TYPE.SHOW_TRANSLATION);
      translateRes = await translateInternal(q, SOURCE_LANG, TARGET_LANG, ENABLE_API);
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
    default:
      break;
  }
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
