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

chrome.webNavigation.onDOMContentLoaded.addListener(async (details) => {
  const frameIds = [details.frameId];
  let injectionCheck;
  try {
    injectionCheck = await chrome.scripting.executeScript({
      target: {tabId: details.tabId, frameIds: frameIds},
      function: () => {
        // check if constants.js has been injected
        const checkResult = {
          constants: false,
          utils: false
        }
        if (typeof CONTEXTMENU_TRANSLATE_ID === 'string') {
          checkResult.constants = true;
        }
        // check if utils.js has been injected
        if (typeof storageGetP === 'function') {
          checkResult.utils = true;
        }
        return checkResult;
      }
    });
  } catch(e) {
    console.log(`Error: ${e}, skip injecting everything`);
    return;
  }
  const topDocInjectionCheck = injectionCheck[0]
  if (!topDocInjectionCheck) {
    console.log('no injection check on top document, something wrong');
    return;
  }
  const topDocInjectionCheckRes = topDocInjectionCheck.result;
  try {
    if (!topDocInjectionCheckRes.constants) {
      await chrome.scripting.executeScript({
        target: {tabId: details.tabId, frameIds: frameIds},
        files: [ 'common/constants.js' ]
      });
    }
    if (!topDocInjectionCheckRes.utils) {
      await chrome.scripting.executeScript({
        target: {tabId: details.tabId, frameIds: frameIds},
        files: [ 'common/utils.js' ]
      });
    }
    await chrome.scripting.executeScript({
      target: {tabId: details.tabId, frameIds: frameIds},
      files: [ 'content/content.js' ]
    });
  } catch(e) {
    console.log(`Error: ${e}, something is wrong, failed to inject content scripts`);
  }
})