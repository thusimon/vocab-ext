import TranslateAPI from "../../background/translate-api";
import { DEFAULT_SETTING, STORAGE_AREA } from "../../common/constants";
import { removeAllChildNodes, sendMessage, storageGetP } from "../../common/utils";

const translateAPI = new TranslateAPI();

const translateLoadingE = document.getElementById('translate-loading');
const translateDataE = document.getElementById('translate-data');
const translateErrorE = document.getElementById('translate-error');
const selectionTextE = document.getElementById('selection-text');
const translateSentenceE = document.getElementById('sentence');
const dictCE = document.getElementById('dict-container');
const dictE = document.getElementById('dict');
const examplesCE = document.getElementById('examples-container');
const examplesE = document.getElementById('examples');
const readVocabBtn = document.getElementById('read-vocab-button');
const addVocabBtn = document.getElementById('add-vocab-button');

let translateResult;

const viewsE = [translateLoadingE, translateDataE, translateErrorE];

const showSpecificView = (index) => {
  viewsE.forEach((view, idx) => {
    const classNameToAdd = idx === index ? 'show' : 'hide';
    const classNameToRemove = idx === index ? 'hide' : 'show';
    view.classList.remove(classNameToRemove);
    view.classList.add(classNameToAdd);
  });
};

const showLoadingView = () => {
  showSpecificView(0);
};

const showTranslateView = () => {
  showSpecificView(1);
  addVocabBtn.className = 'empty-svg'
};

const showErrorView = () => {
  showSpecificView(2);
};

const processDictResult = (dictCE, dictE, dicts) => {
  removeAllChildNodes(dictE);
  if (dicts && dicts.length > 0) {
    dictCE.className = 'translate-entry';
    dicts.forEach(dict => {
      const dictEntry = document.createElement('div');
      dictEntry.classList.add('dict-entry')
      const pos = dict.pos;
      const terms = (dict.terms || []).join(', ')
      dictEntry.textContent = `[${pos}]: ${terms}`;
      dictE.appendChild(dictEntry);
    });
  } else {
    dictCE.className = 'translate-entry hide';
  }
}

const processExamples = (examplesCE, examplesE, examples) => {
  removeAllChildNodes(examplesE);
  if (examples && examples.length > 0) {
    // take only the first two
    examplesCE.className = 'translate-entry';
    const lessExamples = examples.slice(0, 2);
    const domParser = new DOMParser();
    lessExamples.forEach((example, idx) => {
      const exampleEntry = document.createElement('div');
      exampleEntry.classList.add('example-entry');
      const exampleText = example.text || '';
      const exampleTextParsed = domParser.parseFromString(`<span>${idx+1}. ${exampleText}</span>`, 'text/html');
      exampleEntry.append(exampleTextParsed.body.firstElementChild!);
      examplesE.appendChild(exampleEntry);
    });
  } else {
    examplesCE.className = 'translate-entry hide';
  }
};

const _doTranslate = async (text: string) => {
  if (!text) {
    return;
  }
  text = text.trim().toLowerCase();
  if (!text) {
    return;
  }
  const settings = await storageGetP(STORAGE_AREA.SETTINGS, DEFAULT_SETTING);
  const {SOURCE_LANG, TARGET_LANG} = settings;
  try {
    const translateRes = await translateAPI.translateFree(encodeURIComponent(text), SOURCE_LANG, TARGET_LANG);
    return translateRes;
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }
}

readVocabBtn.addEventListener('click', async evt => {
  evt.stopPropagation();
  const settings = await storageGetP(STORAGE_AREA.SETTINGS, DEFAULT_SETTING);
  const synthesis = window.speechSynthesis;
  if (!translateResult || !translateResult.originalText || synthesis.speaking) {
    return;
  }
  const utterOriginal = new SpeechSynthesisUtterance(translateResult.originalText);
  utterOriginal.lang = settings.SOURCE_LANG as unknown as string;
  synthesis.speak(utterOriginal);
});

addVocabBtn.addEventListener('click', async evt => {
  evt.stopPropagation();
  if (!translateResult) {
    return;
  }
  await sendMessage('addToVocab', translateResult, () => {});
  addVocabBtn.className = 'fill-svg';
});

chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  const {type, data} = msg;
  if (!type) {
    return;
  }
  switch (type) {
    case 'SELECTED_TEXT': {
      const { selectionText } = data;
      selectionTextE.textContent = selectionText;
      showLoadingView();
      try {
        translateResult = await _doTranslate(selectionText);
        translateSentenceE.textContent = translateResult.translatedText;
        processDictResult(dictCE, dictE, translateResult.dictResult);
        processExamples(examplesCE, examplesE, translateResult.exampleRes)
        showTranslateView();
      } catch (e) {

      }
      break;
    }
  }
});
