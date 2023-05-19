import TranslateAPI from "../../background/translate-api";
import { DEFAULT_SETTING, STORAGE_AREA } from "../../common/constants";
import { removeAllChildNodes, storageGetP } from "../../common/utils";

const translateAPI = new TranslateAPI();

const selectionTextE = document.getElementById('selection-text');
const translateDataE = document.getElementById('translate-data');
const translateLoadingE = document.getElementById('translate-loading');

const processDictResult = (dictE, dicts) => {
  removeAllChildNodes(dictE);
  if (dicts && dicts.length > 0) {
    dicts.forEach(dict => {
      const dictEntry = document.createElement('div');
      dictEntry.classList.add('dict-entry')
      const pos = dict.pos;
      const terms = (dict.terms || []).join(', ')
      dictEntry.textContent = `[${pos}]: ${terms}`;
      dictE.appendChild(dictEntry);
    });
  }
}

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

chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  const {type, data} = msg;
  if (!type) {
    return;
  }
  switch (type) {
    case 'SELECTED_TEXT': {
      const { selectionText } = data;
      selectionTextE.textContent = selectionText;
      translateDataE.classList.add('hide');
      translateLoadingE.classList.remove('hide');
      translateDataE.classList.add('hide');
      const translateResult = await _doTranslate(selectionText);
      translateLoadingE.classList.add('hide');
      translateDataE.classList.remove('hide');
      translateDataE.textContent = JSON.stringify(translateResult);
      console.log(10, translateResult);
      break;
    }
  }
});
