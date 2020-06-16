const translateAPI = new TranslateAPI()
  , CONTEXT_TRANSLATE_ID = 'CONTEXT_TRANSLATE_ID';

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
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {type, data});
  });
}

const sendTranslationToTab = (translateRes) => {
  sendMessageToCurrentTab('getTranslate', translateRes);
}


const onTranslateClick = async (info, tab) => {
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
    default:
      break;
  }
});
