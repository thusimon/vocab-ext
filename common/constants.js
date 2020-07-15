const CONTEXTMENU_TRANSLATE_ID = 'CONTEXTMENU_TRANSLATE_ID'

const TRANSLATE_ID = '13eaeb3e-aeb5-11ea-b3de-0242ac130004';
const TRANSLATE_IFRAME_ID = `${TRANSLATE_ID}-iframe`;

const STORAGE_AREA = {
  VOCAB: 'VOCAB',
  SETTINGS: 'SETTINGS'
};

const DEFAULT_SETTING = {
  SOURCE_LANG: 'en',
  TARGET_LANG: 'zh',
  ENABLE_API: false
};

const DOM_ID = {
  CONTAINER: `${TRANSLATE_ID}-vocab-container`,
  IFRAME: `${TRANSLATE_ID}-vocab-translate`
};
const FRAME_EVENT_TYPE = {
  GET_TRANSLATION: `${TRANSLATE_IFRAME_ID}-getTranslation`,
  SEND_TRANSLATION: `${TRANSLATE_IFRAME_ID}-sendTranslation`,
  SET_SIZE: `${TRANSLATE_IFRAME_ID}-setSize`,
  CLICK_ADD_BTN: `${TRANSLATE_IFRAME_ID}-clickAddBtn`
};

const I18Ns = {
  ar: {
    name: '\u0627\u0644\u0639\u0631\u0628\u064a\u0629'
  },
  de: {
    name: 'Deutsch'
  },
  el: {
    name: '\u0395\u03bb\u03bb\u03b7\u03bd\u03b9\u03ba\u03ac'
  },
  en: {
    name: 'English'
  },
  es: {
    name: '\u0045\u0073\u0070\u0061\u00f1\u006f\u006c'
  },
  fr: {
    name: '\u0046\u0072\u0061\u006e\u00e7\u0061\u0069\u0073'
  },
  hi: {
    name: '\u0939\u093f\u0928\u094d\u0926\u0940'
  },
  id: {
    name: 'Bahasa Indonesia'
  },
  it: {
    name: 'Italiano'
  },
  ja: {
    name: '\u65e5\u672c\u8a9e'
  },
  ko: {
    name: '\ud55c\uad6d\uc5b4'
  },
  la: {
    name: 'Latina'
  },
  nl: {
    name: 'Nederlands'
  },
  no: {
    name: 'Norsk'
  },
  pl: {
    name: 'Polski'
  },
  pt: {
    name: '\u0050\u006f\u0072\u0074\u0075\u0067\u0075\u00ea\u0073'
  },
  ru: {
    name: '\u0420\u0443\u0441\u0441\u043a\u0438\u0439'
  },
  sv: {
    name: 'Svenska'
  },
  th: {
    name: '\u0e44\u0e17\u0e22'
  },
  ug: {
    name: '\u0055\u0079\u01a3\u0075\u0072\u0071\u0259'
  },
  vi: {
    name: '\u0056\u0069\u1ec7\u0074\u006e\u0061\u006d'
  },
  zh: {
    name: '\u4E2D\u6587'
  },
  ['zh-tw']: {
    name: '\u4e2d\u6587\u53f0\u7063'
  }
}