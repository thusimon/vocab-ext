const mainAsync = async () => {
  const tbody = document.getElementById('vocab-tbody');
  const srcLangE = document.getElementById('src-lang');
  const tarLangE = document.getElementById('tar-lang');

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

  const vocabs = await storageGetP(STORAGE_AREA.VOCAB, {});
  const vocabsWithSetting = vocabs[`${SOURCE_LANG}-${TARGET_LANG}`] || {};

  let idx = 1;
  for (const original in vocabsWithSetting) {
    createTableRow(original, vocabsWithSetting[original], idx);
    idx++;
  }
}

(async () => {
  await mainAsync();
})();