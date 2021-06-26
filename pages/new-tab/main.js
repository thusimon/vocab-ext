const vocabDisplayE = document.getElementById('vocab-display')
  , vocabWelcomeE = document.getElementById('no-vocab')
  , refreshBtnE = document.getElementById('refresh-btn')
  , originalVocabE = document.getElementById('vocab-original')
  , dictE = document.getElementById('dict')
  , translationE = document.getElementById('translation')
  , totalCountE = document.getElementById('total-count');

const getVocabs = async () => {
  const {SOURCE_LANG, TARGET_LANG} = await storageGetP(STORAGE_AREA.SETTINGS, DEFAULT_SETTING);
  const vocabs = await storageGetP(STORAGE_AREA.VOCAB, {});
  const vocabTranslateArea = `${SOURCE_LANG}-${TARGET_LANG}`;
  return vocabs[vocabTranslateArea] || {};
}

const getRandomVocabulary = (vocabsWithSetting) => {
  const vocabsKey = Object.keys(vocabsWithSetting)

  if (vocabsKey.length > 0) {
    const idx = Math.round(Math.random() * (vocabsKey.length -1));
    const key = vocabsKey[idx];
    return {...{original: key}, ...vocabsWithSetting[key]}
  }
  return null;
}

refreshBtnE.addEventListener('click', async () => {
  const vocabs = await getVocabs()
  const randomVocab = getRandomVocabulary(vocabs);
  constructNewTabVocab(randomVocab);
});

const constructNewTabVocab = (vocab) => {
  const {dict, original, translation} = vocab;
  originalVocabE.textContent = original;
  translationE.textContent = translation;
  while (dictE.firstChild) {
    dictE.removeChild(dictE.firstChild);
  }
  if (dict && dict.length > 0) {
    dict.forEach(d => {
      const oneDictE = document.createElement('div');
      oneDictE.className = 'dict-item';
      const typeE = document.createElement('span');
      typeE.className = 'dict-type';
      typeE.textContent = `[${d.pos}]`;
      const dictContentE = document.createElement('span');
      dictContentE.className = 'dict-content';
      dictContentE.textContent = d.terms.join(', ');
      oneDictE.append(typeE, dictContentE);
      dictE.append(oneDictE);
    })
  }
}

(async () => {
  const vocabs = await getVocabs()
  const randomVocab = getRandomVocabulary(vocabs);
  if (randomVocab) {
    vocabDisplayE.style.display = 'block';
    vocabWelcomeE.style.display = 'none';
    constructNewTabVocab(randomVocab);
  } else {
    vocabDisplayE.style.display = 'none';
    vocabWelcomeE.style.display = 'block';
  }
  const vocabsLen = Object.keys(vocabs).length
  totalCountE.textContent = `Total: ${vocabsLen}`
})()