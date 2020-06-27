let isModified = false;
const createComboBox = (id, options, defaultValue) => {
  const listE = document.createElement('select');
  listE.id = id;
  for (let key in options) {
    const optionE = document.createElement('option');
    const option = options[key];
    optionE.value = key;
    optionE.textContent = `${option.name}(${key})`;
    if (defaultValue === key) {
      optionE.selected = 'selected';
    }
    listE.append(optionE);
  }
  return listE;
}

window.addEventListener('DOMContentLoaded', async () => {
  const sourceLangE = document.getElementById('source-language');
  const targetLangE = document.getElementById('target-language');
  const enableAPIE = document.getElementById('advanced-api-chkbox');
  const settings = await storageGetP(STORAGE_AREA.SETTINGS, DEFAULT_SETTING);
  const {SOURCE_LANG, TARGET_LANG, ENABLE_API} = settings;
  const sourceLangOpts = createComboBox('source-lang-opt', I18Ns, SOURCE_LANG);
  const targetLangOpts = createComboBox('target-lang-opt', I18Ns, TARGET_LANG);
  sourceLangE.append(sourceLangOpts);
  targetLangE.append(targetLangOpts);
  enableAPIE.checked = ENABLE_API;

  const saveBtnE = document.getElementById('save-setting-btn');
  saveBtnE.addEventListener('click', async () => {
    const SOURCE_LANG = sourceLangOpts.value;
    const TARGET_LANG = targetLangOpts.value;
    const ENABLE_API = enableAPIE.checked;
    await storageSetP(STORAGE_AREA.SETTINGS, {SOURCE_LANG, TARGET_LANG, ENABLE_API});
    isModified = false;
    window.close();
  });

  sourceLangOpts.addEventListener('change', () => {
    isModified = true;
  });
  targetLangOpts.addEventListener('change', () => {
    isModified = true;
  });
  enableAPIE.addEventListener('change', () => {
    isModified = true;
  })

});

window.addEventListener('beforeunload', (evt) => {
  if (isModified) {
    evt.preventDefault();
    evt.returnValue = '';
  }
});
