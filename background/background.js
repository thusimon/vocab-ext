console.log('bg inited');

const translateAPI = new TranslateAPI();
const context_root_id = 'context_root_id';

const addVocabularyToStorage = (translateRes) => {
  const {originalText, translatedText} = translateRes;
  chrome.storage.local.set({[originalText]: {
    translation: translatedText,
    createdTime: Date.now()
  }}, function() {
    console.log(`vocabulary ${originalText}: ${translatedText}`);
  });
}

const onAddVocabularyClick = async (info, tab) => {
  let q = info.selectionText;
  if (q) {
    q = q.trim().toLowerCase();
    q = encodeURIComponent(q);
    try {
      const translateRes = await translateAPI.translateFree(q, 'en', 'zh', 'text');
      addVocabularyToStorage(translateRes);
    } catch (e) {
      console.log(`Error: ${e.message}`);
    }
  }
}


chrome.contextMenus.create({
  id: context_root_id,
  title: 'Add to vocabulary',
  contexts: ['selection'],
  onclick : onAddVocabularyClick
});
