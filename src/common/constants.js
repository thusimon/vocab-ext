const CONTEXTMENU_TRANSLATE_ID = 'CONTEXTMENU_TRANSLATE_ID';

const TRANSLATE_ID = 'ea13eb3e-aeb5-11ea-b3de-0242ac130004';
const TRANSLATE_IFRAME_ID = `${TRANSLATE_ID}-iframe`;
const CARD_CSS_CHECK_TIMEOUT = 10000; // 10 seconds to get the triggering card element

const STORAGE_AREA = {
  VOCAB: 'VOCAB',
  SETTINGS: 'SETTINGS'
};

const DEFAULT_SETTING = {
  SOURCE_LANG: 'en',
  TARGET_LANG: 'zh',
  ENABLE_API: false,
  ENABLE_CARD: false,
  CARD_TIME: 5,
  CARD_TRIGGER_CSS: ''
};

const DOM_ID = {
  CONTAINER: `${TRANSLATE_ID}-vocab-container`,
  TRANSLATE_IFRAME: `${TRANSLATE_ID}-vocab-translate`,
  CARD_IFRAME: `${TRANSLATE_ID}-vocab-card`,
  TRANSLATE_MODAL: `${TRANSLATE_ID}-vocab-translate`
};

const FRAME_EVENT_TYPE = {
  GET_TRANSLATION: `${DOM_ID.TRANSLATE_IFRAME}-getTranslation`,
  GET_CARD: `${DOM_ID.CARD_IFRAME}-getCard`,
  SEND_TRANSLATION: `${DOM_ID.TRANSLATE_IFRAME}-sendTranslation`,
  SEND_CARD: `${DOM_ID.CARD_IFRAME}-sendCard`,
  SET_TRANSLATION_SIZE: `${DOM_ID.TRANSLATE_IFRAME}-setSize`,
  SET_CARD_SIZE: `${DOM_ID.CARD_IFRAME}-setSize`,
  CLICK_ADD_BTN: `${DOM_ID.TRANSLATE_IFRAME}-clickAddBtn`,
  CLOSE_TRANSLATE_MODAL: `${DOM_ID.TRANSLATE_IFRAME}-clickCloseBtn`,
  CLOSE_CARD_MODAL: `${DOM_ID.CARD_IFRAME}-clickCloseBtn`
};

const RUNTIME_EVENT_TYPE = {
  LOAD_TRANSLATION: 'loadTranslation',
  GET_TRANSLATION: 'getTranslation',
  ERROR_TRANSLATION: 'errorTranslation',
  CARD_TRANSLATION: 'cardTranslation'
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
    name: 'English',
    stat_vocab_add_header: 'Statistics of adding new vocabulary',
    stat_this_week: 'This week',
    stat_this_month: 'This month',
    stat_this_quarter: 'This quarter',
    stat_this_year: 'This year',
    stat_all_data: 'All data',
    popover_refresh_memory: 'Refresh your memory!',
    popover_view_your_vocab: 'View your vocabularies',
    popover_statistics: 'Statistics',
    popover_settings: 'Settings',
    popover_version: 'Version'
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
    name: '\u4E2D\u6587',
    stat_vocab_add_header: '\u65B0\u589E\u8BCD\u6C47\u7684\u7EDF\u8BA1\u56FE',
    stat_this_week: '\u672C\u5468',
    stat_this_month: '\u672C\u6708',
    stat_this_quarter: '\u672C\u5B63\u5EA6',
    stat_this_year: '\u4ECA\u5E74',
    stat_all_data: '\u5168\u4F53\u6570\u636E',
    popover_refresh_memory: '\u6E29\u6545\u800C\u77E5\u65B0!',
    popover_view_your_vocab: '\u6D4F\u89C8\u751F\u8BCD\u8868',
    popover_statistics: '\u7EDF\u8BA1',
    popover_settings: '\u8BBE\u7F6E',
    popover_version: '\u7248\u672C'
  },
  ['zh-tw']: {
    name: '\u4e2d\u6587\u53f0\u7063',
    stat_vocab_add_header: '\u65B0\u589E\u8A5E\u532F\u7684\u7D71\u8A08\u5716',
    stat_this_week: '\u672C\u5468',
    stat_this_month: '\u672C\u6708',
    stat_this_quarter: '\u672C\u5B63\u5EA6',
    stat_this_year: '\u4ECA\u5E74',
    stat_all_data: '\u5168\u9AD4\u6578\u64DA',
    popover_refresh_memory: '\u6EAB\u6545\u800C\u77E5\u65B0!',
    popover_view_your_vocab: '\u6D4F\u89BD\u751F\u8A5E\u8868',
    popover_statistics: '\u7D71\u8A08',
    popover_settings: '\u8A2D\u7F6E',
    popover_version: '\u7248\u672C'
  }
};

const LangCodeMapping = {
  zh: 'zh-CN',
  ['zh-tw']: 'zh-TW'
};
