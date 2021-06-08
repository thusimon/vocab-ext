importScripts('common/constants.js', 'common/utils.js', 'background/translate-api.js');


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

const sendMessageToCurrentTab = (tabId, type, data) => {
  chrome.tabs.sendMessage(tabId, {type, data});
}

const onTranslateClick = async (info, tab) => {
  let q = info.selectionText;
  if (q) {
    q = q.trim().toLowerCase();
    try {
      const translateRes = await translateInternal(q);
      sendMessageToCurrentTab(tab.id, 'getTranslate', translateRes);
    } catch (e) {
      console.log(`Error: ${e.message}`);
      sendMessageToCurrentTab('translateError', e.message);
    }
  }
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
  console.log('onDOMContentLoaded', details)
  const injectRest = await chrome.scripting.executeScript(
    {
      target: {tabId: details.tabId},
      files: [ 'content/content.js' ]
    }
  );
  console.log(injectRest)
})