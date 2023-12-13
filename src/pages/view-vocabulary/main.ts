import {
  STORAGE_AREA, DEFAULT_SETTING
} from '../../common/constants';
import {
  storageGetP, storageSetP, getI18NMessage, debounce
} from '../../common/utils';

(async () => {

const settings = await storageGetP(STORAGE_AREA.SETTINGS, DEFAULT_SETTING);
const {SOURCE_LANG, TARGET_LANG, UI_LANG, UI_TAREGT_LANG_SAME } = settings;
const uiLang = UI_TAREGT_LANG_SAME ? TARGET_LANG : UI_LANG;

let I18Ns: {[key: string]: any};
// due to service-worker inactive after 5min, use try catch to make sure the data is obtained
try {
  I18Ns = await chrome.runtime.sendMessage({type: 'getI18NStrings'});
} catch(e) {
  I18Ns = await chrome.runtime.sendMessage({type: 'getI18NStrings'});
}

const toaster = document.getElementById('toaster');
const toasterMsg = document.getElementById('toaster-msg');
const toasterBtns = document.getElementById('toaster-buttons');
const toasterOKBtn = document.getElementById('toaster-ok');
const toasterCancelBtn = document.getElementById('toaster-cancel');
const tbody = document.getElementById('vocab-tbody');
const srcLangE = document.getElementById('src-lang');
const tarLangE = document.getElementById('tar-lang');
const createdAtE = document.getElementById('created-at');
const exportBtn = document.getElementById('export-vocab');
const importBtn = document.getElementById('import-vocab');
const editBtn = document.getElementById('edit-vocab');
const deleteBtn = document.getElementById('delete-vocab');
const importFile = document.getElementById('import-file');
const readBtn = document.getElementById('read-vocab');
const pauseReadBtn = document.getElementById('pause-read-vocab');
const saveBtn = document.getElementById('save-vocab');
const searchField = document.getElementById('vocab-search') as HTMLInputElement;
const countLabelE = document.getElementById('total-vocab-label');
const countE = document.getElementById('total-vocab-count');
const pageIdxE = document.getElementById('vocab-page') as HTMLInputElement;
const pageTotalE = document.getElementById('vocab-page-total');
const BATCH_NUM = 200;

let editedItems = {};
let deletedItems = {};
let isModified = false;
let readingGenerator;
let isPaused = true;
let toasterOKCallback: (() => void) | null = null;
let selectedVocabTr: HTMLElement | null = null;
let sortedVocabs: any[] = [];

const synth = window.speechSynthesis;

const vocabs = await storageGetP(STORAGE_AREA.VOCAB, {});
const vocabsWithSetting = vocabs[`${SOURCE_LANG}-${TARGET_LANG}`] || {};
const vocabsArr = Object.keys(vocabsWithSetting).map(key => ({
  original: key,
  ...vocabsWithSetting[key]
}));
const totalPage = Math.ceil(vocabsArr.length / BATCH_NUM);
pageTotalE.textContent = totalPage + '';
pageIdxE.max = totalPage + '';

let pageIdx = parseInt(pageIdxE.value);
let sortCriteria = 'src-lang:1';

pageIdxE.addEventListener('change', (evt) => {
  pageIdx = parseInt(pageIdxE.value);
  showVocabs(sortCriteria);
});

const createTableRow = (vocab, idx) => {
  const {original, translation, createdTime, dict} = vocab;
  const td1 = document.createElement('td');
  const td2 = document.createElement('td');
  const td3 = document.createElement('td');

  td1.textContent = original;

  td2.className = 'translate-table-cell'
  const translateInput = document.createElement('input');
  translateInput.classList.add('input-disable');
  td2.append(translateInput);
  translateInput.value = translation;
  
  if (dict && dict.length > 0) {
    const details = dict.reduce((prev, current) => {
      const {pos, terms} = current;
      const currentDetail = (pos && terms && terms.length > 0) ? `${pos}:${terms.join(',')}` : '';
      return prev ? `${prev}|${currentDetail}` : currentDetail;
    }, '');
    td2.title = details;
  }

  td3.textContent = new Date(createdTime).toLocaleString('en-US', {hour12: false});

  const tr = document.createElement('tr');
  tr.append(td1);
  tr.append(td2);
  tr.append(td3);
  tbody.append(tr);
}

document.title = getI18NMessage(I18Ns, uiLang, 'vocab_title');
srcLangE.textContent = getI18NMessage(I18Ns, SOURCE_LANG, 'name');
tarLangE.textContent = getI18NMessage(I18Ns, TARGET_LANG, 'name');
createdAtE.textContent = getI18NMessage(I18Ns, uiLang, 'vocab_createdAt');

toasterOKBtn.textContent = getI18NMessage(I18Ns, uiLang, 'ok');
toasterCancelBtn.textContent = getI18NMessage(I18Ns, uiLang, 'cancel');

exportBtn.title = getI18NMessage(I18Ns, uiLang, 'vocab_export_desp');
importBtn.title = getI18NMessage(I18Ns, uiLang, 'vocab_import_desp');
editBtn.title = getI18NMessage(I18Ns, uiLang, 'vocab_edit_desp');
deleteBtn.title = getI18NMessage(I18Ns, uiLang, 'vocab_delete_desp');
saveBtn.title = getI18NMessage(I18Ns, uiLang, 'vocab_save_desp');
readBtn.title = getI18NMessage(I18Ns, uiLang, 'vocab_pronounce_desp');
pauseReadBtn.title = getI18NMessage(I18Ns, uiLang, 'vocab_pause_pronounce_desp');
searchField.placeholder = getI18NMessage(I18Ns, uiLang, 'vocab_search_desp');
countLabelE.textContent = getI18NMessage(I18Ns, uiLang, 'total');

const sortVocabs = (vocabsArr, criteria, ascending) => {
  return vocabsArr.sort((vocabA, vocabB) => {
    if (criteria === 'tar-lang') {
      return vocabA.translation.localeCompare(vocabB.translation) * ascending;
    } else if (criteria === 'created-at') {
      return (vocabA.createdTime - vocabB.createdTime) * ascending;
    } else {
      return vocabA.original.localeCompare(vocabB.original) * ascending;
    }
  });
};

const showVocabs = async (sortCriteria) => {
  srcLangE.classList.remove('high-light');
  tarLangE.classList.remove('high-light');
  createdAtE.classList.remove('high-light');
  const sortParts = sortCriteria.split(':');
  const sortCategory = sortParts[0];
  const ascending = parseInt(sortParts[1]);
  document.getElementById(sortCategory).classList.add('high-light');
  sortedVocabs = sortVocabs(vocabsArr, sortCategory, ascending);
  setVocabs(sortedVocabs);
  countE.textContent = `${sortedVocabs.length}`;
};

const setVocabs = (vocabs) => {
  while(tbody.firstChild){
    tbody.removeChild(tbody.firstChild);
  }
  const pagedVocabs = vocabs.slice((pageIdx - 1) * BATCH_NUM, pageIdx * BATCH_NUM);
  pagedVocabs.forEach(createTableRow);
};

const showToaster = (msg, type='info', needConsent=false) => {
  toasterMsg.textContent = msg;
  toaster.classList.remove('show', 'hide');
  toasterMsg.classList.remove('info', 'error');
  toasterBtns.classList.remove('no-display');
  const colorClass = type === 'info' ? 'info' : 'error'
  toasterMsg.classList.add(colorClass);
  toaster.classList.add('show');
  if (!needConsent) {
    toasterBtns.classList.add('no-display');
    setTimeout(() => {
      toaster.classList.remove('show');
      toaster.classList.add('hide');
    }, 5000);
  }
}

const validateImportFile = (fileJson) => {
  for (let langKey in fileJson) {
    const langKeyParts = langKey.split('-');
    if (langKeyParts.length != 2) {
      throw new Error('language source or target missing');
    }
    const sourceLang = langKeyParts[0];
    const targetLang = langKeyParts[1];
    const i18nLangKeys = Object.keys(I18Ns);
    if (!i18nLangKeys.includes(sourceLang) || !i18nLangKeys.includes(targetLang)) {
      throw new Error(`invalid source(${sourceLang}) or target(${targetLang}) language`);
    }
  }
}

const readOneVocab = (vocab, setting) => {
  return new Promise((resolve, reject) => {
    const utterOriginal = new SpeechSynthesisUtterance(vocab.original);
    const utterTranslated = new SpeechSynthesisUtterance(vocab.translation);
    utterOriginal.lang = setting.SOURCE_LANG;
    utterTranslated.lang = setting.TARGET_LANG;
    utterOriginal.addEventListener('end', (evt) => {
      // original text is read
      setTimeout(() => {
        synth.speak(utterTranslated);
      }, 200);
    });
    utterTranslated.addEventListener('end', (evt) => {
      setTimeout(() => {
        resolve(true);
      }, 0);
    });
    synth.speak(utterOriginal);
  })
}

const readVocabs = (generator) => {
  if (isPaused) {
    return;
  }
  const next = generator.next();
  if (next.value) {
    next.value.then(() => {
      setTimeout(() => {
        readVocabs(generator);
      }, 600);
    });
  } else {
    readAllVocabs();
  }
}

function* getNextReadVocab(vocabs, settings) {
  for (const vocab of vocabs) {
    yield readOneVocab(vocab, settings);
  }
}

const readAllVocabs = async () => {
  const setting = await storageGetP(STORAGE_AREA.SETTINGS, DEFAULT_SETTING);
  readingGenerator = getNextReadVocab(sortedVocabs, setting);
  readVocabs(readingGenerator);
}

const togglePlayPauseIcon = (isPaused) => {
  if (isPaused) {
    // should show the play icon
    pauseReadBtn.classList.add('no-display');
    readBtn.classList.remove('no-display');
  } else {
    // should show the pause icon
    pauseReadBtn.classList.remove('no-display');
    readBtn.classList.add('no-display');
  }
}

const onFileLoaded = async (evt) => {
  const fileContent = evt.target.result;
  let fileJson;
  try {
    fileJson = JSON.parse(fileContent);
    validateImportFile(fileJson);
    const vocabs = await storageGetP(STORAGE_AREA.VOCAB, {});
    for (let langKey in fileJson) {
      const vocabsInLangKeys = vocabs[langKey] || {};
      const newVocabs = fileJson[langKey] || {};
      for (let v in newVocabs) {
        vocabsInLangKeys[v] = newVocabs[v]
      }
      vocabs[langKey] = vocabsInLangKeys;
    }
    await storageSetP(STORAGE_AREA.VOCAB, vocabs);
    await showVocabs(sortCriteria);
  } catch (e) {
    showToaster(e.message, 'error');
  }
}

const getVocabItem = (trE) => {
  const originalText = trE.childNodes[0].textContent;
  const translationE = trE.childNodes[1].childNodes[0];
  return {
    originalText,
    translationE
  };
}

let srcLangAscending = 1;
srcLangE.addEventListener('click', () => {
  sortCriteria = `src-lang:${srcLangAscending}`;
  showVocabs(sortCriteria);
  srcLangAscending *= -1;
});

let tarLangAscending = 1;
tarLangE.addEventListener('click', () => {
  sortCriteria = `tar-lang:${tarLangAscending}`;
  showVocabs(sortCriteria);
  tarLangAscending *= -1;
});

let createdAtAscending = 1;
createdAtE.addEventListener('click', () => {
  sortCriteria = `created-at:${createdAtAscending}`;
  showVocabs(sortCriteria);
  createdAtAscending *= -1;
});

importFile.addEventListener('change', (event) => {
  const input = event.target! as HTMLInputElement;
  if (!input.files || !input.files[0]) {
    return undefined;
  }
  const file = input.files[0];
  const fr = new FileReader();
  fr.onload = onFileLoaded;
  fr.readAsText(file);
  input.value = '';
});

exportBtn.addEventListener('click', async () => {
  const vocabs = await storageGetP(STORAGE_AREA.VOCAB, {});
  const vocabsStr = JSON.stringify(vocabs, null, ' ');
  const blob = new Blob([vocabsStr], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = "vocab-exported.json";  
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
});

importBtn.addEventListener('click', () => {
  importFile.click();
});

editBtn.addEventListener('click', () => {
  if (selectedVocabTr) {
    const {originalText, translationE} = getVocabItem(selectedVocabTr);
    translationE.classList.remove('input-disable');
    translationE.classList.add('input-enable');
    translationE.focus();
    editedItems[originalText] = translationE;
    isModified = true;
  }
});

deleteBtn.addEventListener('click', () => {
  if (selectedVocabTr) {
    const {originalText} = getVocabItem(selectedVocabTr);
    deletedItems[originalText] = true;
    selectedVocabTr.remove();
    selectedVocabTr = null;
    isModified = true;
  }
});

readBtn.addEventListener('click', () => {
  if (!toasterOKCallback) {
    toasterOKCallback = readAllVocabs;
    showToaster(getI18NMessage(I18Ns ,uiLang, 'vocab_pronounce_msg'), 'info', true);
  } else {
    // already notified user
    isPaused = !isPaused;
    togglePlayPauseIcon(isPaused);
    if (readingGenerator && !isPaused) {
      readVocabs(readingGenerator);
    }
  }
});

pauseReadBtn.addEventListener('click', () => {
  isPaused = !isPaused;
  togglePlayPauseIcon(isPaused);
  if (readingGenerator && !isPaused) {
    readVocabs(readingGenerator);
  }
})

saveBtn.addEventListener('click', async () => {
  if (Object.keys(deletedItems).length == 0 && Object.keys(editedItems).length == 0) {
    return;
  }
  // get a copy of the current vocab
  const setting = await storageGetP(STORAGE_AREA.SETTINGS, DEFAULT_SETTING);
  const vocab = await storageGetP(STORAGE_AREA.VOCAB, {});
  const langKeySetting = `${setting.SOURCE_LANG}-${setting.TARGET_LANG}`;
  const vocabByLangKeySetting = vocab[langKeySetting] || {};
  // process the edited
  for (let key in editedItems) {
    if (vocabByLangKeySetting[key]) {
      vocabByLangKeySetting[key].translation = editedItems[key].value;
    }
  }
  // process the deleted
  for (let key in deletedItems) {
    delete vocabByLangKeySetting[key];
  }
  // save vocabs
  vocab[langKeySetting] = vocabByLangKeySetting;
  await storageSetP(STORAGE_AREA.VOCAB, vocab);
  isModified = false;
  editedItems = {};
  deletedItems = {};
  await showVocabs(sortCriteria);
});

searchField.addEventListener('input', debounce(evt => {
  const value = evt.target.value;
  const filteredVocabs = sortedVocabs.filter((vocab: {original: string, translation: string}) => {
    const {original, translation} = vocab;
    return original.includes(value) || translation.includes(value);
  });
  setVocabs(filteredVocabs);
}, 200));

toasterOKBtn.addEventListener('click', (evt) => {
  if (toasterOKCallback) {
    isPaused = false;
    toasterOKCallback();
    togglePlayPauseIcon(isPaused);
    toaster.classList.remove('show');
    toaster.classList.add('hide');
  }
});

toasterCancelBtn.addEventListener('click', (evt) => {
  toasterOKCallback = null;
  isPaused = true;
  togglePlayPauseIcon(isPaused);
  toaster.classList.remove('show');
  toaster.classList.add('hide');
});

tbody.addEventListener('click', (evt) => {
  const targetE = evt.target;
  if (!(targetE instanceof HTMLTableCellElement)) {
    return;
  }
  if (selectedVocabTr) {
    selectedVocabTr.classList.remove('selected');
    const node = selectedVocabTr.childNodes[1].childNodes[0] as HTMLElement;
    node.classList.remove('selected');
  }
  selectedVocabTr = targetE.parentNode as HTMLElement;
  selectedVocabTr.classList.add('selected');
  const node = selectedVocabTr.childNodes[1].childNodes[0] as HTMLElement;
  node.classList.add('selected');
});

window.addEventListener('beforeunload', (evt) => {
  if (isModified) {
    evt.preventDefault();
    evt.returnValue = 'Are you sure to leave without saving?';
  }
});

await showVocabs(sortCriteria);

})();
