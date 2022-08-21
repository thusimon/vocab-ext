(async () => {

let isModified = false;
const createComboBox = (id, options, defaultValue) => {
  const listE = document.createElement('select');
  listE.id = id;
  for (let key in options) {
    const optionE = document.createElement('option');
    const option = options[key];
    optionE.value = key;
    const keyValue = LangCodeMapping[key] ? LangCodeMapping[key] : key;
    optionE.textContent = `${option.name}(${keyValue})`;
    if (defaultValue === key) {
      optionE.selected = 'selected';
    }
    listE.append(optionE);
  }
  return listE;
}

const saveBtnE = document.getElementById('save-setting-btn');
const headerOptionE = document.getElementById('header-option');
const headerSettingsE = document.getElementById('header-settings');
const sourceLangLabelE = document.getElementById('source-language-label');
const targetLangLabelE = document.getElementById('target-language-label');
const sourceLangE = document.getElementById('source-language');
const targetLangE = document.getElementById('target-language');
const sourceLangOpts = createComboBox('source-lang-opt', I18Ns);
const targetLangOpts = createComboBox('target-lang-opt', I18Ns);
sourceLangE.append(sourceLangOpts);
targetLangE.append(targetLangOpts);
//const enableAPIE = document.getElementById('advanced-api-chkbox');
const enableCardLabelE = document.getElementById('glossary-card-label');
const enableCardE = document.getElementById('glossary-card-chkbox');
const enableCardCheckLabelE = document.getElementById('glossary-card-chkbox-label');
const cardTimeLabelE = document.getElementById('glossary-card-time-label');
const cardTimeE = document.getElementById('glossary-card-time-select');
const cardTimeDespE = document.getElementById('glossary-card-time-persist-label');
const cardTriggerLabelE = document.getElementById('element-trigger-cards-label');
const cardTriggerE = document.getElementById('element-trigger-cards-input');

const settings = await storageGetP(STORAGE_AREA.SETTINGS, DEFAULT_SETTING);

const render = settings => {
  const {SOURCE_LANG, TARGET_LANG, ENABLE_CARD, CARD_TIME, CARD_TRIGGER_CSS} = settings;
  saveBtnE.title = getI18NMessage(TARGET_LANG, 'settings_save');
  headerOptionE.textContent = getI18NMessage(TARGET_LANG, 'settings_option');
  headerSettingsE.textContent = getI18NMessage(TARGET_LANG, 'settings_settings');
  sourceLangLabelE.textContent = getI18NMessage(TARGET_LANG, 'settings_src_lang');
  targetLangLabelE.textContent = getI18NMessage(TARGET_LANG, 'settings_tar_lang');
  sourceLangOpts.value = SOURCE_LANG;
  targetLangOpts.value = TARGET_LANG;
  //enableAPIE.checked = ENABLE_API;
  enableCardLabelE.textContent = getI18NMessage(TARGET_LANG, 'settings_show_card');
  enableCardE.checked = ENABLE_CARD;
  enableCardCheckLabelE.textContent = getI18NMessage(TARGET_LANG, 'settings_show_card_desp');
  cardTimeLabelE.textContent = getI18NMessage(TARGET_LANG, 'settings_card_timeout');
  cardTimeE.value = CARD_TIME;
  if (ENABLE_CARD) {
    cardTimeE.disabled = false;
  } else {
    cardTimeE.disabled = true;
  }
  cardTimeDespE.textContent = getI18NMessage(TARGET_LANG, 'settings_card_timeout_desp');
  cardTriggerLabelE.textContent = getI18NMessage(TARGET_LANG, 'settings_ele_trigger');
  cardTriggerE.value = CARD_TRIGGER_CSS;
  cardTriggerE.placeholder = getI18NMessage(TARGET_LANG, 'settings_ele_trigger_desp');
  cardTriggerE.title = getI18NMessage(TARGET_LANG, 'settings_ele_trigger_desp');
};


saveBtnE.addEventListener('click', async () => {
  const SOURCE_LANG = sourceLangOpts.value;
  const TARGET_LANG = targetLangOpts.value;
  const ENABLE_API = false;
  const ENABLE_CARD = enableCardE.checked;
  const CARD_TIME = cardTimeE.value;
  const CARD_TRIGGER_CSS = cardTriggerE.value;
  await storageSetP(STORAGE_AREA.SETTINGS, {SOURCE_LANG, TARGET_LANG, ENABLE_API, ENABLE_CARD, CARD_TIME, CARD_TRIGGER_CSS});
  isModified = false;
  window.close();
});

sourceLangOpts.addEventListener('change', () => {
  isModified = true;
});

targetLangOpts.addEventListener('change', () => {
  isModified = true;
  const SOURCE_LANG = sourceLangOpts.value;
  const TARGET_LANG = targetLangOpts.value;
  //const ENABLE_API = enableAPIE.checked;
  const ENABLE_CARD = enableCardE.checked;
  const CARD_TIME = cardTimeE.value;
  const CARD_TRIGGER_CSS = cardTriggerE.value;
  render({
    SOURCE_LANG,
    TARGET_LANG,
    ENABLE_CARD,
    CARD_TIME,
    CARD_TRIGGER_CSS
  });
});

// enableAPIE.addEventListener('change', () => {
//   isModified = true;
// });

enableCardE.addEventListener('change', evt => {
  isModified = true;
  if (evt.target.checked) {
    cardTimeE.disabled = false;
  } else {
    cardTimeE.disabled = true;
  }
});

cardTimeE.addEventListener('change', () => {
  isModified = true;
});

cardTriggerE.addEventListener('change', () => {
  isModified = true;
});

window.addEventListener('beforeunload', (evt) => {
  if (isModified) {
    evt.preventDefault();
    evt.returnValue = 'Are you sure to leave without saving?';
  }
});

render(settings);

})();
