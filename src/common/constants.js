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
  TARGET_LANG: 'en',
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
    ok: 'OK',
    cancel: 'Cancel',
    total: 'Total',
    stat_title: 'Statistics',
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
    popover_version: 'Version',
    settings_title: 'Settings',
    settings_save: 'Save the settings',
    settings_option: 'Option',
    settings_settings: 'Settings',
    settings_src_lang: 'Source Language',
    settings_tar_lang: 'Target Language',
    settings_show_card: 'Show glossary card',
    settings_show_card_desp: 'Show a random glossary card every time you open a web page',
    settings_card_timeout: 'Glossary card timeout',
    settings_card_timeout_desp: 'The time (seconds) that glossary card persists on a web page',
    settings_ele_trigger: 'Element triggers cards',
    settings_ele_trigger_desp: 'css selector of an element, glossary card shows when that element is clicked, e.g, the upperleft logo on YouTube: a#logo',
    vocab_title: 'Vocabulary',
    vocab_export_desp: 'Export all the vocabularies as a json file',
    vocab_import_desp: 'Import and update vocabularies from a json file, Attention: this will overwrite all your current vocabularies',
    vocab_edit_desp: 'Edit the selected vocabulary',
    vocab_delete_desp: 'Delete the selected vocabulary',
    vocab_save_desp: 'Save all the modifications',
    vocab_pronounce_desp: 'Pronounce all the vocabularies one by one',
    vocab_pronounce_msg: 'Vocabularies will be read aloud, please adjust the volumn',
    vocab_pause_pronounce_desp: 'Pause the pronounce',
    vocab_search_desp: 'Search vocabulary',
    vocab_createdAt: 'Created at',
    newtab_title: 'New Tab',
    newtab_no_vocab_msg: `You haven't added any vocabulary, use context menu to translate and add them:)`
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
    ok: '\u786E\u5B9A',
    cancel: '\u53D6\u6D88',
    total: '\u603B\u8BA1',
    stat_title: '\u7EDF\u8BA1',
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
    popover_version: '\u7248\u672C',
    settings_title: '\u8BBE\u7F6E',
    settings_save: '\u4FDD\u5B58\u8BBE\u7F6E',
    settings_option: '\u9009\u9879',
    settings_settings: '\u8BBE\u7F6E',
    settings_src_lang: '\u539F\u59CB\u8BED\u8A00',
    settings_tar_lang: '\u76EE\u6807\u8BED\u8A00',
    settings_show_card: '\u663E\u793A\u751F\u8BCD\u5361',
    settings_show_card_desp: '\u6BCF\u4E00\u6B21\u6253\u5F00\u7F51\u9875\u65F6, \u663E\u793A\u4E00\u4E2A\u968F\u673A\u7684\u751F\u8BCD\u5361',
    settings_card_timeout: '\u751F\u8BCD\u5361\u65F6\u95F4',
    settings_card_timeout_desp: '\u751F\u8BCD\u5361\u5728\u7F51\u9875\u4E0A\u505C\u7559\u7684\u65F6\u95F4(\u79D2)',
    settings_ele_trigger: '\u751F\u8BCD\u5361\u89E6\u53D1',
    settings_ele_trigger_desp: 'CSS\u9009\u62E9\u5668, \u5F53\u70B9\u51FB\u8FD9\u4E2ACSS\u9009\u62E9\u7684\u5143\u7D20\u65F6, \u751F\u8BCD\u5361\u5C31\u4F1A\u663E\u793A, \u6BD4\u5982YouTube\u5DE6\u4E0A\u89D2\u7684\u56FE\u6807, CSS\u9009\u62E9\u5668\u662Fa#logo',
    vocab_title: '\u8BCD\u6C47\u8868',
    vocab_export_desp: '\u5C06\u6240\u6709\u7684\u8BCD\u6C47\u8868\u5BFC\u51FA\u4E3AJSON\u6587\u4EF6',
    vocab_import_desp: '\u4ECEJSON\u6587\u4EF6\u5BFC\u5165\u8BCD\u6C47\u8868, \u6CE8\u610F: \u8FD9\u5C06\u8986\u76D6\u4F60\u73B0\u6709\u7684\u6240\u6709\u8BCD\u6C47\u8868',
    vocab_edit_desp: '\u7F16\u8F91\u9009\u4E2D\u7684\u8BCD\u6C47',
    vocab_delete_desp: '\u5220\u9664\u9009\u4E2D\u7684\u8BCD\u6C47',
    vocab_save_desp: '\u4FDD\u5B58\u6240\u6709\u6539\u52A8',
    vocab_pronounce_desp: '\u4F9D\u6B21\u6717\u8BFB\u6240\u6709\u7684\u8BCD\u6C47',
    vocab_pronounce_msg: '\u8BCD\u6C47\u8868\u5C06\u88AB\u6717\u8BFB, \u8BF7\u8C03\u6574\u97F3\u91CF',
    vocab_pause_pronounce_desp: '\u6682\u505C\u6717\u8BFB',
    vocab_search_desp: '\u641C\u7D22\u8BCD\u6C47\u8868',
    vocab_createdAt: '\u521B\u5EFA\u4E8E',
    newtab_title: '\u7A7A\u767D\u9875',
    newtab_no_vocab_msg: '\u4F60\u8FD8\u6CA1\u6709\u6DFB\u52A0\u4EFB\u4F55\u8BCD\u6C47, \u8BF7\u7528\u53F3\u952E\u83DC\u5355\u6765\u7FFB\u8BD1\u5E76\u6DFB\u52A0\u5B83\u4EEC'
  },
  zh_tw: {
    name: '\u4e2d\u6587\u53f0\u7063',
    ok: '\u78BA\u5B9A',
    cancel: '\u53D6\u6D88',
    total: '\u7E3D\u8A08',
    stat_title: '\u7D71\u8A08',
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
    popover_version: '\u7248\u672C',
    settings_title: '\u8A2D\u7F6E',
    settings_save: '\u4FDD\u5B58\u8A2D\u7F6E',
    settings_option: '\u9078\u9805',
    settings_settings: '\u8A2D\u7F6E',
    settings_src_lang: '\u539F\u59CB\u8A9E\u8A00',
    settings_tar_lang: '\u76EE\u6A19\u8A9E\u8A00',
    settings_show_card: '\u986F\u793A\u751F\u8A5E\u5361',
    settings_show_card_desp: '\u6BCF\u4E00\u6B21\u6253\u958B\u7DB2\u9801\u6642, \u986F\u793A\u4E00\u500B\u96A8\u6A5F\u7684\u751F\u8A5E\u5361',
    settings_card_timeout: '\u751F\u8A5E\u5361\u6642\u9593',
    settings_card_timeout_desp: '\u751F\u8A5E\u5361\u5728\u7DB2\u9801\u4E0A\u505C\u7559\u7684\u6642\u9593(\u79D2)',
    settings_ele_trigger: '\u751F\u8A5E\u5361\u89F8\u767C',
    settings_ele_trigger_desp: 'CSS\u9078\u64C7\u5668, \u7576\u9EDE\u64CA\u9019\u500BCSS\u9078\u64C7\u7684\u5143\u7D20\u6642, \u751F\u8A5E\u5361\u5C31\u6703\u986F\u793A, \u6BD4\u5982YouTube\u5DE6\u4E0A\u89D2\u7684\u5716\u6A19, CSS\u9078\u64C7\u5668\u662Fa#logo',
    vocab_title: '\u8A5E\u5F59\u8868',
    vocab_export_desp: '\u5C07\u6240\u6709\u7684\u8A5E\u5F59\u8868\u5C0E\u51FA\u70BAJSON\u6587\u4EF6',
    vocab_import_desp: '\u5F9EJSON\u6587\u4EF6\u5C0E\u5165\u8A5E\u5F59\u8868, \u6CE8\u610F: \u9019\u5C07\u8986\u84CB\u4F60\u73FE\u6709\u7684\u6240\u6709\u8A5E\u5F59\u8868',
    vocab_edit_desp: '\u7DE8\u8F2F\u9078\u4E2D\u7684\u8A5E\u5F59',
    vocab_delete_desp: '\u522A\u9664\u9078\u4E2D\u7684\u8A5E\u5F59',
    vocab_save_desp: '\u4FDD\u5B58\u6240\u6709\u6539\u52D5',
    vocab_pronounce_desp: '\u4F9D\u6B21\u6717\u8B80\u6240\u6709\u7684\u8A5E\u5F59',
    vocab_pronounce_msg: '\u8A5E\u5F59\u8868\u5C07\u88AB\u6717\u8B80, \u8ACB\u8ABF\u6574\u97F3\u91CF',
    vocab_pause_pronounce_desp: '\u66AB\u505C\u6717\u8B80',
    vocab_search_desp: '\u641C\u7D22\u8A5E\u5F59\u8868',
    vocab_createdAt: '\u5275\u5EFA\u4E8E',
    newtab_title: '\u7A7A\u767D\u9801',
    newtab_no_vocab_msg: '\u4F60\u9084\u6C92\u6709\u6DFB\u52A0\u4EFB\u4F55\u8A5E\u5F59, \u8ACB\u7528\u53F3\u9375\u83DC\u55AE\u4F86\u7FFB\u8B6F\u4E26\u6DFB\u52A0\u5B83\u5011'
  }
};

const LangCodeMapping = {
  zh: 'zh-CN',
  ['zh_tw']: 'zh-TW'
};
