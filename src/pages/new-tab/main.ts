import {
  STORAGE_AREA, DEFAULT_SETTING
} from '../../common/constants';
import {
  storageGetP, getI18NMessage
} from '../../common/utils';

(async () => {
let sourceLang, targetLang, randomVocab;

const settings = await storageGetP(STORAGE_AREA.SETTINGS, DEFAULT_SETTING);
const { SOURCE_LANG, TARGET_LANG, UI_LANG, UI_TAREGT_LANG_SAME } = settings;
sourceLang = SOURCE_LANG;
targetLang = TARGET_LANG;
const uiLang = UI_TAREGT_LANG_SAME ? TARGET_LANG : UI_LANG;

let I18Ns: {[key: string]: any};
// due to service-worker inactive after 5min, use try catch to make sure the data is obtained
try {
  I18Ns = await chrome.runtime.sendMessage({type: 'getI18NStrings'});
} catch(e) {
  I18Ns = await chrome.runtime.sendMessage({type: 'getI18NStrings'});
}

const vocabDisplayE = document.getElementById('vocab-display')!;
const vocabWelcomeE = document.getElementById('no-vocab')!;
const refreshBtnE = document.getElementById('refresh-btn')!;
const originalVocabE = document.getElementById('vocab-original')!;
const dictE = document.getElementById('dict')!;
const translationE = document.getElementById('translation')!;
const totalCountLabelE = document.getElementById('total-vocab-label')!;
const totalCountE = document.getElementById('total-vocab-count')!;
const readBtnE = document.getElementById('read-vocab-button')!;

const getVocabs = async (sourceLang, targetLang) => {
  const vocabs = await storageGetP(STORAGE_AREA.VOCAB, {});
  const vocabTranslateArea = `${sourceLang}-${targetLang}`;
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

const readOneVocab = (vocab, lang) => {
  const utter = new SpeechSynthesisUtterance(vocab.original);
  utter.lang = lang;
  const synth = window.speechSynthesis;
  synth.speak(utter);
}

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
      dictContentE.textContent = (d.terms || []).join(', ');
      oneDictE.append(typeE, dictContentE);
      dictE.append(oneDictE);
    })
  }
}

refreshBtnE.addEventListener('click', async () => {
  const vocabs = await getVocabs(sourceLang, targetLang)
  randomVocab = getRandomVocabulary(vocabs);
  constructNewTabVocab(randomVocab);
});

readBtnE.addEventListener('click', () => {
  readOneVocab(randomVocab, sourceLang);
});

const vocabs = await getVocabs(sourceLang, targetLang);
randomVocab = getRandomVocabulary(vocabs);
if (randomVocab) {
  vocabDisplayE.style.display = 'block';
  vocabWelcomeE.style.display = 'none';
  constructNewTabVocab(randomVocab);
} else {
  vocabDisplayE.style.display = 'none';
  vocabWelcomeE.style.display = 'block';
  vocabWelcomeE.textContent = getI18NMessage(I18Ns, uiLang, 'newtab_no_vocab_msg');
}
totalCountLabelE.textContent = getI18NMessage(I18Ns, uiLang, 'total');
totalCountE.textContent = `${Object.keys(vocabs).length}`;
document.title = getI18NMessage(I18Ns, uiLang, 'newtab_title');

})()