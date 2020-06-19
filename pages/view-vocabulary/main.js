const mainAsync = async () => {
  const toaster = document.getElementById('toaster');
  const tbody = document.getElementById('vocab-tbody');
  const srcLangE = document.getElementById('src-lang');
  const tarLangE = document.getElementById('tar-lang');
  const exportBtn = document.getElementById('export-vocab');
  const importBtn = document.getElementById('import-vocab');
  const importFile = document.getElementById('import-file');

  const createTableRow = (original, vocabularyItem, idx) => {
    const {translation, createdTime} = vocabularyItem;
    const td1 = document.createElement('td');
    const td2 = document.createElement('td');
    const td3 = document.createElement('td');
    const td4 = document.createElement('td');
    td1.textContent = idx;
    td2.textContent = original;
    td3.textContent = translation;
    td4.textContent = new Date(createdTime).toLocaleString('en');
    const tr = document.createElement('tr');
    tr.append(td1);
    tr.append(td2);
    tr.append(td3);
    tr.append(td4);
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

  const showToaster = (msg, type=0) => {
    toaster.textContent = msg;
    const colorClass = type === 0 ? 'info' : 'error'
    toaster.classList.add('show', colorClass);
    setTimeout(() => {
      toaster.classList.remove('show', 'info', 'error');
    }, 3000)
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
    } catch (e) {
      showToaster(e.message, 1);
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

  await showVocabs();
}

(async () => {
  await mainAsync();
})();