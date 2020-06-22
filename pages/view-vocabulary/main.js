const mainAsync = async () => {
  const toaster = document.getElementById('toaster');
  const toasterMsg = document.getElementById('toaster-msg');
  const toasterBtns = document.getElementById('toaster-buttons');
  const toasterOKBtn = document.getElementById('toaster-ok');
  const toasterCancelBtn = document.getElementById('toaster-cancel');
  const tbody = document.getElementById('vocab-tbody');
  const srcLangE = document.getElementById('src-lang');
  const tarLangE = document.getElementById('tar-lang');
  const exportBtn = document.getElementById('export-vocab');
  const importBtn = document.getElementById('import-vocab');
  const importFile = document.getElementById('import-file');
  const readBtn = document.getElementById('read-vocab');
  const pauseReadBtn = document.getElementById('pause-read-vocab');
  const restoreBtn = document.getElementById('reset-vocab');
  const saveBtn = document.getElementById('save-vocab');
  let editedItems = {};
  let deletedItems = {};
  let isModified = false;
  let readingGenerator;
  let isPaused = false;
  let toasterOKCallback = null;

  const synth = window.speechSynthesis;

  const createTableRow = (original, vocabularyItem, idx) => {
    const {translation, createdTime} = vocabularyItem;
    const td1 = document.createElement('td');
    const td2 = document.createElement('td');
    const td3 = document.createElement('td');
    const td4 = document.createElement('td');
    const td5 = document.createElement('td');

    td1.textContent = idx;
    
    td2.textContent = original;

    td3.className = 'translate-table-cell'
    const translateInput = document.createElement('input');
    translateInput.classList.add('input-disable');
    td3.append(translateInput);
    translateInput.value = translation;
    
    td4.textContent = new Date(createdTime).toLocaleString('en');

    const editBtn = document.createElement('button');
    const deleteBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    deleteBtn.textContent = 'Delete';
    td5.append(editBtn, deleteBtn);

    const tr = document.createElement('tr');
    tr.append(td1);
    tr.append(td2);
    tr.append(td3);
    tr.append(td4);
    tr.append(td5);
    tbody.append(tr);
  }

  const settings = await storageGetP(STORAGE_AREA.SETTINGS, DEFAULT_SETTING);
  const {SOURCE_LANG, TARGET_LANG} = settings;
  srcLangE.textContent = I18Ns[SOURCE_LANG].name;
  tarLangE.textContent = I18Ns[TARGET_LANG].name;

  const showVocabs = async () => {
    const vocabs = await storageGetP(STORAGE_AREA.VOCAB, {});
    const vocabsWithSetting = vocabs[`${SOURCE_LANG}-${TARGET_LANG}`] || {};

    while(tbody.firstChild){
      tbody.removeChild(tbody.firstChild);
    }
    let idx = 1;
    for (const original in vocabsWithSetting) {
      createTableRow(original, vocabsWithSetting[original], idx);
      idx++;
    }
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
      await showVocabs();
      throw new Error('yyoyoyoyoyoyoyoyo');
    } catch (e) {
      showToaster(e.message, 'error');
    }
  }

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
    for (let vocabItem in vocabs) {
      const readContent = {
        original: vocabItem,
        translation: vocabs[vocabItem].translation
      }
      yield readOneVocab(readContent, settings);
    }
  }

  const readAllVocabs = async () => {
    const setting = await storageGetP(STORAGE_AREA.SETTINGS, DEFAULT_SETTING);
    const vocab = await storageGetP(STORAGE_AREA.VOCAB, {});
    const langKeySetting = `${setting.SOURCE_LANG}-${setting.TARGET_LANG}`;
    const vocabByLangKeySetting = vocab[langKeySetting] || {};
    readingGenerator = getNextReadVocab(vocabByLangKeySetting, setting);
    readVocabs(readingGenerator);
  }

  readBtn.addEventListener('click', () => {
    toasterOKCallback = readAllVocabs;
    showToaster('Vocabularies will be read aloud, please adjust volumn', 'info', true);
  });

  pauseReadBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseReadBtn.textContent = isPaused ? 'Resume' : 'Pause';
    if (readingGenerator && !isPaused) {
      readVocabs(readingGenerator);
    }
  })

  restoreBtn.addEventListener('click', () => {
    isModified = false;
    editedItems = {};
    deletedItems = {};
    showVocabs();
  });

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
    await showVocabs();
  });

  toasterOKBtn.addEventListener('click', (evt) => {
    if (toasterOKCallback) {
      toasterOKCallback();
      toaster.classList.remove('show');
      toaster.classList.add('hide');
    }
  });

  toasterCancelBtn.addEventListener('click', (evt) => {
    toaster.classList.remove('show');
    toaster.classList.add('hide');
  })

  const getVocabItem = (buttonE) => {
    const trE = buttonE.parentNode.parentNode;
    const originalText = trE.childNodes[1].textContent;
    const translationE = trE.childNodes[2].childNodes[0];
    return {
      originalText,
      translationE
    };
  }

  tbody.addEventListener('click', (evt) => {
    const targetE = evt.target;
    if (!(targetE instanceof HTMLButtonElement)) {
      return;
    }
    isModified = true;
    const buttonType = targetE.textContent === 'Edit' ? 'edit' : 'delete';
    switch (buttonType) {
      case 'edit':{
        const {originalText, translationE} = getVocabItem(evt.target);
        translationE.classList.remove('input-disable');
        translationE.classList.add('input-enable');
        translationE.focus();
        editedItems[originalText] = translationE;
        break;
      }
      case 'delete': {
        const {originalText, translationE} = getVocabItem(evt.target);
        translationE.parentNode.parentNode.classList.add('strikeout');
        deletedItems[originalText] = true;
        break;
      }
      default:
        break;
    }
  });

  window.addEventListener('beforeunload', (evt) => {
    if (isModified) {
      evt.preventDefault();
      evt.returnValue = '';
    }
  })

  await showVocabs();
}

(async () => {
  await mainAsync();
})();