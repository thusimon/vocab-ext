const translateAPI = new TranslateAPI();

let contextMenuTabId
  , contextMenuFrameId;

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

const sendMessageToCurrentTab = (type, data) => {
  if (typeof contextMenuTabId === 'undefined') {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type, data});
    });
  } else {
    chrome.tabs.sendMessage(contextMenuTabId, {type, data}, {frameId: contextMenuFrameId});
  }
}

const onTranslateClick = async (info, tab) => {
  const settings = await storageGetP(STORAGE_AREA.SETTINGS, DEFAULT_SETTING);
  const {SOURCE_LANG, TARGET_LANG, ENABLE_API} = settings;
  let q = info.selectionText;
  if (q) {
    q = q.trim().toLowerCase();
    try {
      const translateRes = ENABLE_API ? await translateAPI.translate(q, SOURCE_LANG, TARGET_LANG, 'text') :
        await translateAPI.translateFree(encodeURIComponent(q), SOURCE_LANG, TARGET_LANG, 'text')
      sendMessageToCurrentTab('getTranslate', translateRes);
    } catch (e) {
      console.log(`Error: ${e.message}`);
      sendMessageToCurrentTab('translateError', e.message);
    }
  }  
}

let tkk;
let translateWebAppClientEnabled = true;
const getGoogleTranslateTKK = async () => {
  try {
    const fetchRes = await fetch('https://translate.google.com/');
    if (fetchRes.ok) {
      const resp = await fetchRes.text();
      const tkkMatch = resp.match(/tkk:['"]([0-9.]+)['"]/)
      if (tkkMatch) {
        tkk = tkkMatch[1];
        translateWebAppClientEnabled = true;
      }
    }
    throw 'can not get tkk'
  } catch (e) {
    translateWebAppClientEnabled = false;
  }
}

chrome.contextMenus.create({
  id: CONTEXTMENU_TRANSLATE_ID,
  title: 'Translate the selected text',
  contexts: ['selection'],
  onclick : onTranslateClick
});

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
    case 'onContextMenuShow': {
      contextMenuFrameId = sender.frameId;
      contextMenuTabId = sender.tab.id;
      sendResponse('frameId recorded');
      break;
    }
    default:
      break;
  }
});
