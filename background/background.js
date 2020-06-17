const translateAPI = new TranslateAPI()
  , CONTEXT_TRANSLATE_ID = 'CONTEXT_TRANSLATE_ID';

let contextMenuTabId
  , contextMenuFrameId;

const addVocabularyToStorage = (translateRes) => {
  const {originalText, translatedText} = translateRes;
  chrome.storage.local.set({[originalText]: {
    translation: translatedText,
    createdTime: Date.now()
  }}, function() {
    console.log(`vocabulary ${originalText}: ${translatedText}`);
  });
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

const sendTranslationToTab = (translateRes) => {
  sendMessageToCurrentTab('getTranslate', translateRes);
}


const onTranslateClick = async (info, tab) => {
  console.log(26, tab);
  let q = info.selectionText;
  if (q) {
    q = q.trim().toLowerCase();
    q = encodeURIComponent(q);
    try {
      const translateRes = await translateAPI.translateFree(q, 'en', 'zh', 'text');
      sendMessageToCurrentTab('getTranslate', translateRes);
    } catch (e) {
      console.log(`Error: ${e.message}`);
      sendMessageToCurrentTab('translateError', e.message);
    }
  }  
}

chrome.contextMenus.create({
  id: CONTEXT_TRANSLATE_ID,
  title: 'Translate the selected text',
  contexts: ['selection'],
  onclick : onTranslateClick
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const {type, data} = request;
  console.log(data)
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
