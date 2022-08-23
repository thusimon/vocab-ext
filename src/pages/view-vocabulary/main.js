(async () => {

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
const searchField = document.getElementById('vocab-search');
const countLabelE = document.getElementById('total-vocab-label');
const countE = document.getElementById('total-vocab-count');

let editedItems = {};
let deletedItems = {};
let isModified = false;
let readingGenerator;
let isPaused = true;
let toasterOKCallback = null;
let selectedVocabTr = null;
let sortedVocabs = [];

const synth = window.speechSynthesis;

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
      const currentDetail = `${current.pos}:${current.terms.join(',')}`;
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

const settings = await storageGetP(STORAGE_AREA.SETTINGS, DEFAULT_SETTING);
const {SOURCE_LANG, TARGET_LANG} = settings;
document.title = getI18NMessage(TARGET_LANG, 'vocab_title');
srcLangE.textContent = getI18NMessage(SOURCE_LANG, 'name');
tarLangE.textContent = getI18NMessage(TARGET_LANG, 'name');
createdAtE.textContent = getI18NMessage(TARGET_LANG, 'vocab_createdAt');

toasterOKBtn.textContent = getI18NMessage(TARGET_LANG, 'ok');
toasterCancelBtn.textContent = getI18NMessage(TARGET_LANG, 'cancel');

exportBtn.title = getI18NMessage(TARGET_LANG, 'vocab_export_desp');
importBtn.title = getI18NMessage(TARGET_LANG, 'vocab_import_desp');
editBtn.title = getI18NMessage(TARGET_LANG, 'vocab_edit_desp');
deleteBtn.title = getI18NMessage(TARGET_LANG, 'vocab_delete_desp');
saveBtn.title = getI18NMessage(TARGET_LANG, 'vocab_save_desp');
readBtn.title = getI18NMessage(TARGET_LANG, 'vocab_pronounce_desp');
pauseReadBtn.title = getI18NMessage(TARGET_LANG, 'vocab_pause_pronounce_desp');
searchField.placeholder = getI18NMessage(TARGET_LANG, 'vocab_search_desp');
countLabelE.textContent = getI18NMessage(TARGET_LANG, 'total');

const sortVocabs = (vocabs, criteria, ascending) => {
  const keys = Object.keys(vocabs);
  const vocabsArr = keys.map(key => ({
    original: key,
    ...vocabs[key]
  }));
  return vocabsArr.sort((vocabA, vocabB) => {
    if (criteria === 'tar-lang') {
      return vocabA.translation.localeCompare(vocabB.translation) * ascending;
    } else if (criteria === 'created-at') {
      return (vocabA.createdTime - vocabB.createdTime) * ascending;
    } else {
      return vocabA.original.localeCompare(vocabB.original) * ascending;
    }
  });

}
const showVocabs = async (sortCriteria, ascending) => {
  const vocabs = await storageGetP(STORAGE_AREA.VOCAB, {});
  const vocabsWithSetting = vocabs[`${SOURCE_LANG}-${TARGET_LANG}`] || {};
  srcLangE.classList.remove('high-light');
  tarLangE.classList.remove('high-light');
  createdAtE.classList.remove('high-light');
  document.getElementById(sortCriteria).classList.add('high-light');
  sortedVocabs = sortVocabs(vocabsWithSetting, sortCriteria, ascending);
  setVocabs(sortedVocabs);
  countE.textContent = sortedVocabs.length;
}

const setVocabs = vocabs => {
  while(tbody.firstChild){
    tbody.removeChild(tbody.firstChild);
  }
  vocabs.forEach(createTableRow);
}

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
    }, 3000);
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
        resolve();
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
    await showVocabs('src-lang', srcLangAscending);
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
  showVocabs('src-lang', srcLangAscending);
  srcLangAscending *= -1;
});

let tarLangAscending = 1;
tarLangE.addEventListener('click', () => {
  showVocabs('tar-lang', tarLangAscending);
  tarLangAscending *= -1;
});

let createdAtAscending = 1;
createdAtE.addEventListener('click', () => {
  showVocabs('created-at', createdAtAscending);
  createdAtAscending *= -1;
});

importFile.addEventListener('change', (event) => {
  const input = event.target;
  if (!input.files[0]) {
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
    showToaster(getI18NMessage(TARGET_LANG, 'vocab_pronounce_msg'), 'info', true);
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
  await showVocabs('src-lang', srcLangAscending);
});

searchField.addEventListener('input', debounce(evt => {
  const value = evt.target.value;
  const filteredVocabs = sortedVocabs.filter(vocab => {
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
    selectedVocabTr.childNodes[1].childNodes[0].classList.remove('selected');
  }
  selectedVocabTr = targetE.parentNode;
  selectedVocabTr.classList.add('selected');
  selectedVocabTr.childNodes[1].childNodes[0].classList.add('selected');
});

window.addEventListener('beforeunload', (evt) => {
  if (isModified) {
    evt.preventDefault();
    evt.returnValue = 'Are you sure to leave without saving?';
  }
})

await showVocabs('src-lang', srcLangAscending);

})();
