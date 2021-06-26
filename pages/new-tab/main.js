const vocabDisplayE = document.getElementById('vocab-display')
  , vocabWelcomeE = document.getElementById('no-vocab')
  , refreshBtnE = document.getElementById('refresh-btn')
  , originalVocabE = document.getElementById('vocab-original')
  , dictE = document.getElementById('dict')
  , translationE = document.getElementById('translation');

const getRandomVocabulary = async () => {
  let {SOURCE_LANG, TARGET_LANG} = await storageGetP(STORAGE_AREA.SETTINGS, DEFAULT_SETTING);
  const vocabs = await storageGetP(STORAGE_AREA.VOCAB, {});
  const vocabTranslateArea = `${SOURCE_LANG}-${TARGET_LANG}`;
  const vocabsWithSetting = vocabs[vocabTranslateArea] || {};
  
  const vocabsKey = Object.keys(vocabsWithSetting)

  if (vocabsKey.length > 0) {
    const idx = Math.round(Math.random() * (vocabsKey.length -1));
    const key = vocabsKey[idx];
    return {...{original: key}, ...vocabsWithSetting[key]}
  }
  return null;
}

const constructNewTabVocab = (vocab) => {
  const {dict, createdTime, original, translation} = vocab;
  
}

(async () => {
  const randomVocab = await getRandomVocabulary();
  if (randomVocab) {
    vocabDisplayE.style.display = 'block';
    vocabWelcomeE.style.display = 'none';
  } else {
    vocabDisplayE.style.display = 'none';
    vocabWelcomeE.style.display = 'block';
  }
})()