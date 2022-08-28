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

const findClosestLang = queryLang => {
  const langs = Object.keys(I18Ns);
  queryLang = queryLang.toLowerCase();
  let closestLang = langs.find(lang => lang === queryLang);
  if (closestLang) {
    return closestLang;
  }
  queryLang = queryLang.replace(/[^a-z]/g, '');
  closestLang = langs.find(lang => {
    lang = lang.replace(/[^a-z]/g, '');
    return lang.startsWith(queryLang) || queryLang.startsWith(lang);
  });
  return closestLang ? closestLang : 'en';
};

const saveBtnE = document.getElementById('save-setting-btn');
const headerOptionE = document.getElementById('header-option');
const headerSettingsE = document.getElementById('header-settings');
const sourceLangLabelE = document.getElementById('source-language-label');
const targetLangLabelE = document.getElementById('target-language-label');
const uiLangLabelE = document.getElementById('ui-language-label');
const sourceLangE = document.getElementById('source-language');
const targetLangE = document.getElementById('target-language');
const uiLangE = document.getElementById('ui-language');
const sourceLangOpts = createComboBox('source-lang-opt', I18Ns);
const targetLangOpts = createComboBox('target-lang-opt', I18Ns);
const uiLangOpts = createComboBox('ui-lang-opt', I18Ns);
sourceLangE.append(sourceLangOpts);
targetLangE.append(targetLangOpts);
uiLangE.append(uiLangOpts);
const uitarLangSameE = document.getElementById('ui-tar-lang-same-chkbox');
const uitarLangSameLabelE = document.getElementById('ui-tar-lang-same-chkbox-label');
const enableCardLabelE = document.getElementById('glossary-card-label');
const enableCardE = document.getElementById('glossary-card-chkbox');
const enableCardCheckLabelE = document.getElementById('glossary-card-chkbox-label');
const cardTimeLabelE = document.getElementById('glossary-card-time-label');
const cardTimeE = document.getElementById('glossary-card-time-select');
const cardTimeDespE = document.getElementById('glossary-card-time-persist-label');
const cardTriggerLabelE = document.getElementById('element-trigger-cards-label');
const cardTriggerE = document.getElementById('element-trigger-cards-input');
const toaster = document.getElementById('toaster');
const toasterMsg = document.getElementById('toaster-msg');
const toasterBtns = document.getElementById('toaster-buttons');
const toasterOKBtn = document.getElementById('toaster-ok');

const settings = await storageGetP(STORAGE_AREA.SETTINGS, DEFAULT_SETTING);
if (settings.UI_TAREGT_LANG_SAME) {
  settings.UI_LANG = settings.TARGET_LANG
}

const render = settings => {
  const {SOURCE_LANG, TARGET_LANG, UI_LANG, UI_TAREGT_LANG_SAME, ENABLE_CARD, CARD_TIME, CARD_TRIGGER_CSS} = settings;
  saveBtnE.title = getI18NMessage(UI_LANG, 'settings_save');
  headerOptionE.textContent = getI18NMessage(UI_LANG, 'settings_option');
  headerSettingsE.textContent = getI18NMessage(UI_LANG, 'settings_settings');
  sourceLangLabelE.textContent = getI18NMessage(UI_LANG, 'settings_src_lang');
  targetLangLabelE.textContent = getI18NMessage(UI_LANG, 'settings_tar_lang');
  uiLangLabelE.textContent = getI18NMessage(UI_LANG, 'settings_ui_lang');
  sourceLangOpts.value = SOURCE_LANG;
  targetLangOpts.value = TARGET_LANG;
  uiLangOpts.value = UI_LANG;
  if (UI_TAREGT_LANG_SAME) {
    uiLangOpts.classList.add('no-display');
  } else {
    uiLangOpts.classList.remove('no-display');
  }
  uitarLangSameE.checked = UI_TAREGT_LANG_SAME;
  uitarLangSameLabelE.textContent = getI18NMessage(UI_LANG, 'settings_ui_tar_same');
  enableCardLabelE.textContent = getI18NMessage(UI_LANG, 'settings_show_card');
  enableCardE.checked = ENABLE_CARD;
  enableCardCheckLabelE.textContent = getI18NMessage(UI_LANG, 'settings_show_card_desp');
  cardTimeLabelE.textContent = getI18NMessage(UI_LANG, 'settings_card_timeout');
  cardTimeE.value = CARD_TIME;
  if (ENABLE_CARD) {
    cardTimeE.disabled = false;
  } else {
    cardTimeE.disabled = true;
  }
  cardTimeDespE.textContent = getI18NMessage(UI_LANG, 'settings_card_timeout_desp');
  cardTriggerLabelE.textContent = getI18NMessage(UI_LANG, 'settings_ele_trigger');
  cardTriggerE.value = CARD_TRIGGER_CSS;
  cardTriggerE.placeholder = getI18NMessage(UI_LANG, 'settings_ele_trigger_desp');
  cardTriggerE.title = getI18NMessage(UI_LANG, 'settings_ele_trigger_desp');
  toasterOKBtn.textContent = getI18NMessage(UI_LANG, 'ok');
  document.title = getI18NMessage(UI_LANG, 'settings_title');
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

saveBtnE.addEventListener('click', async () => {
  const SOURCE_LANG = sourceLangOpts.value;
  const TARGET_LANG = targetLangOpts.value;
  const UI_LANG = uiLangOpts.value;
  const UI_TAREGT_LANG_SAME = uitarLangSameE.checked;
  const ENABLE_API = false;
  const ENABLE_CARD = enableCardE.checked;
  const CARD_TIME = cardTimeE.value;
  const CARD_TRIGGER_CSS = cardTriggerE.value;
  await storageSetP(STORAGE_AREA.SETTINGS, {
    SOURCE_LANG,
    TARGET_LANG,
    UI_LANG,
    UI_TAREGT_LANG_SAME,
    ENABLE_API,
    ENABLE_CARD,
    CARD_TIME,
    CARD_TRIGGER_CSS
  });
  isModified = false;
  window.close();
});

sourceLangOpts.addEventListener('change', () => {
  isModified = true;
});

targetLangOpts.addEventListener('change', () => {
  isModified = true;
  const uitarLangSame = uitarLangSameE.checked;
  if (!uitarLangSame) {
    return;
  }
  const SOURCE_LANG = sourceLangOpts.value;
  const TARGET_LANG = targetLangOpts.value;
  const ENABLE_CARD = enableCardE.checked;
  const CARD_TIME = cardTimeE.value;
  const CARD_TRIGGER_CSS = cardTriggerE.value;
  render({
    SOURCE_LANG,
    TARGET_LANG,
    UI_LANG: TARGET_LANG,
    UI_TAREGT_LANG_SAME: true,
    ENABLE_CARD,
    CARD_TIME,
    CARD_TRIGGER_CSS
  });
});

uiLangOpts.addEventListener('change', () => {
  isModified = true;
  const uitarLangSame = uitarLangSameE.checked;
  if (uitarLangSame) {
    return;
  }
  const SOURCE_LANG = sourceLangOpts.value;
  const TARGET_LANG = targetLangOpts.value;
  const UI_LANG = uiLangOpts.value;
  const ENABLE_CARD = enableCardE.checked;
  const CARD_TIME = cardTimeE.value;
  const CARD_TRIGGER_CSS = cardTriggerE.value;
  render({
    SOURCE_LANG,
    TARGET_LANG,
    UI_LANG,
    UI_TAREGT_LANG_SAME: false,
    ENABLE_CARD,
    CARD_TIME,
    CARD_TRIGGER_CSS
  });
});

uitarLangSameE.addEventListener('change', evt => {
  isModified = true;
  if (evt.target.checked) {
    uiLangOpts.classList.add('no-display');
  } else {
    uiLangOpts.classList.remove('no-display');
  }
});

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

toasterOKBtn.addEventListener('click', (evt) => {
  toaster.classList.remove('show');
  toaster.classList.add('hide');
});

window.addEventListener('beforeunload', (evt) => {
  if (isModified) {
    evt.preventDefault();
    evt.returnValue = 'Are you sure to leave without saving?';
  }
});

const url = new URL(document.URL);
if (url.searchParams.get('install') === 'new') {
  const uiLang = await chrome.i18n.getUILanguage();
  const closestLang = findClosestLang(uiLang);
  const closestLangName = I18Ns[closestLang].name;
  const toasterMsg = formatString(getI18NMessage(closestLang, 'settings_detect_lang'), closestLangName);
  toasterOKBtn.textContent = getI18NMessage(closestLang, 'ok');
  showToaster(toasterMsg, 'info', true);
  settings.TARGET_LANG = closestLang;
  settings.UI_LANG = closestLang;
  storageSetP(STORAGE_AREA.SETTINGS, settings);
}

render(settings);

})();
