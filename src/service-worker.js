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

const translateInternal = async (text) => {
  const settings = await storageGetP(STORAGE_AREA.SETTINGS, DEFAULT_SETTING);
  const {SOURCE_LANG, TARGET_LANG, ENABLE_API} = settings;
  const translateRes = ENABLE_API ? await translateAPI.translate(text, SOURCE_LANG, TARGET_LANG, 'text') :
        await translateAPI.translateFree(encodeURIComponent(text), SOURCE_LANG, TARGET_LANG, 'text');
  return translateRes;
}

const sendMessageToCurrentTab = (tabId, frameId, type, data) => {
  const options = {};
  if (Number.isInteger(frameId)) {
    options.frameId = frameId;
  } else {
    options.frameId = 0;
  }
  chrome.tabs.sendMessage(tabId, {type, data}, options);
}

const onTranslateClick = async (info, tab) => {
  contextMenuFrameId = info.frameId;
  let q = info.selectionText;
  if (q) {
    q = q.trim().toLowerCase();
    try {
      const translateRes = await translateInternal(q);
      sendMessageToCurrentTab(tab.id, contextMenuFrameId, 'getTranslate', translateRes);
    } catch (e) {
      console.log(`Error: ${e.message}`);
      sendMessageToCurrentTab(tab.id, contextMenuFrameId, 'translateError', e.message);
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

chrome.webNavigation.onDOMContentLoaded.addListener((details) => {
  const frameIds = [details.frameId];
  chrome.scripting.executeScript({
    target: {tabId: details.tabId, frameIds: frameIds},
    files: [ 'content/content.js' ]
  });
});
