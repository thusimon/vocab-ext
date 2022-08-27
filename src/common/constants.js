const CONTEXTMENU_TRANSLATE_ID = 'CONTEXTMENU_TRANSLATE_ID';

const TRANSLATE_ID = 'ea13eb3e-aeb5-11ea-b3de-0242ac130004';
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
  TRANSLATE_MODAL: `${TRANSLATE_ID}-vocab-translate`
};

const RUNTIME_EVENT_TYPE = {
  LOAD_TRANSLATION: 'loadTranslation',
  GET_TRANSLATION: 'getTranslation',
  ERROR_TRANSLATION: 'errorTranslation',
  CARD_TRANSLATION: 'cardTranslation'
};

const I18Ns = {
  ar: {
    name: '\u0627\u0644\u0639\u0631\u0628\u064a\u0629',
    ok: '\u0646\u0639\u0645',
    cancel: '\u064A\u0644\u063A\u064A',
    total: '\u0627\u0644\u0645\u062C\u0645\u0648\u0639',
    sw_context_translate: '\u062A\u0631\u062C\u0645 \u0627\u0644\u0646\u0635',
    stat_title: '\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A',
    stat_vocab_add_header: '\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u0625\u0636\u0627\u0641\u0629 \u0645\u0641\u0631\u062F\u0627\u062A \u062C\u062F\u064A\u062F\u0629',
    stat_this_week: '\u0647\u0630\u0627 \u0627\u0644\u0627\u0633\u0628\u0648\u0639',
    stat_this_month: '\u0647\u0630\u0627 \u0627\u0644\u0634\u0647\u0631',
    stat_this_quarter: '\u0647\u0630\u0627 \u0627\u0644\u0631\u0628\u0639',
    stat_this_year: '\u0647\u0630\u0647 \u0627\u0644\u0633\u0646\u0629',
    stat_all_data: '\u0643\u0644 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A',
    popover_refresh_memory: '!\u0642\u0645 \u0628\u062A\u062D\u062F\u064A\u062B \u0630\u0627\u0643\u0631\u062A\u0643',
    popover_view_your_vocab: '\u0639\u0631\u0636 \u0627\u0644\u0645\u0641\u0631\u062F\u0627\u062A \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u0643',
    popover_statistics: '\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A',
    popover_settings: '\u0625\u0639\u062F\u0627\u062F\u0627\u062A',
    popover_version: '\u0625\u0635\u062F\u0627\u0631',
    settings_title: '\u0625\u0639\u062F\u0627\u062F\u0627\u062A',
    settings_save: '\u0627\u062D\u0641\u0638 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A',
    settings_option: '\u062E\u064A\u0627\u0631',
    settings_settings: '\u0625\u0639\u062F\u0627\u062F\u0627\u062A',
    settings_src_lang: '\u0644\u063A\u0629 \u0627\u0644\u0645\u0635\u062F\u0631',
    settings_tar_lang: '\u0644\u063A\u0629 \u0627\u0644\u0647\u062F\u0641',
    settings_show_card: '\u0625\u0638\u0647\u0627\u0631 \u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u0645\u0633\u0631\u062F',
    settings_show_card_desp: '\u0623\u0638\u0647\u0631 \u0628\u0637\u0627\u0642\u0629 \u0642\u0627\u0645\u0648\u0633 \u0645\u0635\u0637\u0644\u062D\u0627\u062A \u0639\u0634\u0648\u0627\u0626\u064A\u0629 \u0641\u064A \u0643\u0644 \u0645\u0631\u0629 \u062A\u0641\u062A\u062D \u0641\u064A\u0647\u0627 \u0635\u0641\u062D\u0629 \u0648\u064A\u0628',
    settings_card_timeout: '\u0645\u0647\u0644\u0629 \u0628\u0637\u0627\u0642\u0629 \u0645\u0633\u0631\u062F \u0627\u0644\u0645\u0635\u0637\u0644\u062D\u0627\u062A',
    settings_card_timeout_desp: '\u0627\u0644\u0648\u0642\u062A (\u0628\u0627\u0644\u062B\u0648\u0627\u0646\u064A) \u0627\u0644\u0630\u064A \u062A\u0633\u062A\u0645\u0631 \u0641\u064A\u0647 \u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u0645\u0633\u0631\u062F \u0639\u0644\u0649 \u0635\u0641\u062D\u0629 \u0627\u0644\u0648\u064A\u0628',
    settings_ele_trigger: '\u0639\u0646\u0635\u0631 \u0645\u0634\u063A\u0644\u0627\u062A \u0627\u0644\u0628\u0637\u0627\u0642\u0627\u062A',
    settings_ele_trigger_desp: '\u0645\u062D\u062F\u062F CSS \u0644\u0639\u0646\u0635\u0631 \u060C \u062A\u0638\u0647\u0631 \u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u0645\u0635\u0637\u0644\u062D\u0627\u062A \u0639\u0646\u062F \u0627\u0644\u0646\u0642\u0631 \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u0639\u0646\u0635\u0631 \u060C i.n. \u060C \u0627\u0644\u0634\u0639\u0627\u0631 \u0627\u0644\u0623\u064A\u0633\u0631 \u0627\u0644\u0639\u0644\u0648\u064A \u0639\u0644\u0649 YouTube: a#logo',
    settings_detect_lang: '\u0644\u063A\u0629 \u0627\u0644\u0645\u062A\u0635\u0641\u062D \u0627\u0644\u062A\u064A \u062A\u0645 \u0627\u0643\u062A\u0634\u0627\u0641\u0647\u0627 "{}" \u060C \u064A\u0631\u062C\u0649 \u0627\u0644\u062A\u062D\u0642\u0642 \u062C\u064A\u062F\u064B\u0627 \u0648\u0627\u062E\u062A\u064A\u0627\u0631 \u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0647\u062F\u0641 \u0627\u0644\u0635\u062D\u064A\u062D\u0629',
    vocab_title: '\u0645\u0641\u0631\u062F\u0627\u062A',
    vocab_export_desp: '\u062A\u0635\u062F\u064A\u0631 \u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0641\u0631\u062F\u0627\u062A \u0643\u0645\u0644\u0641 JSON',
    vocab_import_desp: '\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0648\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0645\u0641\u0631\u062F\u0627\u062A \u0645\u0646 \u0645\u0644\u0641 JSON \u060C \u0627\u0646\u062A\u0628\u0647: \u0633\u064A\u0624\u062F\u064A \u0630\u0644\u0643 \u0625\u0644\u0649 \u0627\u0633\u062A\u0628\u062F\u0627\u0644 \u062C\u0645\u064A\u0639 \u0645\u0641\u0631\u062F\u0627\u062A\u0643 \u0627\u0644\u062D\u0627\u0644\u064A\u0629',
    vocab_edit_desp: '\u0642\u0645 \u0628\u062A\u062D\u0631\u064A\u0631 \u0627\u0644\u0645\u0641\u0631\u062F\u0627\u062A \u0627\u0644\u0645\u062E\u062A\u0627\u0631\u0629',
    vocab_delete_desp: '\u0627\u062D\u0630\u0641 \u0627\u0644\u0645\u0641\u0631\u062F\u0627\u062A \u0627\u0644\u0645\u062E\u062A\u0627\u0631\u0629',
    vocab_save_desp: '\u0627\u062D\u0641\u0638 \u062C\u0645\u064A\u0639 \u0627\u0644\u062A\u0639\u062F\u064A\u0644\u0627\u062A',
    vocab_pronounce_desp: '\u0627\u0642\u0631\u0623 \u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0641\u0631\u062F\u0627\u062A \u0648\u0627\u062D\u062F\u0629 \u062A\u0644\u0648 \u0627\u0644\u0623\u062E\u0631\u0649',
    vocab_pronounce_msg: '\u0633\u062A\u062A\u0645 \u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0645\u0641\u0631\u062F\u0627\u062A \u0628\u0635\u0648\u062A \u0639\u0627\u0644\u064D \u060C \u064A\u0631\u062C\u0649 \u0636\u0628\u0637 \u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u0635\u0648\u062A',
    vocab_pause_pronounce_desp: '\u062A\u0648\u0642\u0641 \u0639\u0646 \u0627\u0644\u0642\u0631\u0627\u0621\u0629',
    vocab_search_desp: '\u0627\u0628\u062D\u062B \u0639\u0646 \u0627\u0644\u0645\u0641\u0631\u062F\u0627\u062A',
    vocab_createdAt: '\u0623\u0646\u0634\u0626\u062A \u0641\u064A',
    newtab_title: '\u0639\u0644\u0627\u0645\u0629 \u062A\u0628\u0648\u064A\u0628 \u062C\u062F\u064A\u062F\u0629',
    newtab_no_vocab_msg: `\u0644\u0645 \u062A\u0642\u0645 \u0628\u0625\u0636\u0627\u0641\u0629 \u0623\u064A \u0645\u0641\u0631\u062F\u0627\u062A \u060C \u0627\u0633\u062A\u062E\u062F\u0645 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0633\u064A\u0627\u0642 \u0644\u062A\u0631\u062C\u0645\u062A\u0647\u0627 \u0648\u0625\u0636\u0627\u0641\u062A\u0647\u0627 :)`
  },
  am: {
    name: '\u12A0\u121B\u122D\u129B'
  },
  bg: {
    name: '\u0431\u044A\u043B\u0433\u0430\u0440\u0441\u043A\u0438'
  },
  bn: {
    name: '\u09AC\u09BE\u0982\u09B2\u09BE'
  },
  ca: {
    name: 'catal\xE0'
  },
  cs: {
    name: '\u010De\u0161tina'
  },
  da: {
    name: 'dansk'
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
    sw_context_translate: 'Translate the text',
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
    settings_ele_trigger_desp: 'CSS selector of an element, glossary card shows when that element is clicked, e.g., the upper left logo on YouTube: a#logo',
    settings_detect_lang: 'Detected browser language "{}", please double check and choose the correct target language',
    vocab_title: 'Vocabulary',
    vocab_export_desp: 'Export all the vocabularies as a JSON file',
    vocab_import_desp: 'Import and update vocabularies from a JSON file, Attention: this will overwrite all your current vocabularies',
    vocab_edit_desp: 'Edit the selected vocabulary',
    vocab_delete_desp: 'Delete the selected vocabulary',
    vocab_save_desp: 'Save all the modifications',
    vocab_pronounce_desp: 'Read all the vocabularies one by one',
    vocab_pronounce_msg: 'Vocabularies will be read aloud, please adjust the volume',
    vocab_pause_pronounce_desp: 'Pause the reading',
    vocab_search_desp: 'Search vocabulary',
    vocab_createdAt: 'Created at',
    newtab_title: 'New Tab',
    newtab_no_vocab_msg: `You haven't added any vocabulary, use context menu to translate and add them:)`
  },
  es: {
    name: '\u0045\u0073\u0070\u0061\u00f1\u006f\u006c'
  },
  et: {
    name: 'eesti keel'
  },
  fa: {
    name: '\u0641\u0627\u0631\u0633\u06CC'
  },
  fi: {
    name: 'suomi'
  },
  fil: {
    name: 'Wikang Filipino'
  },
  fr: {
    name: '\u0046\u0072\u0061\u006e\u00e7\u0061\u0069\u0073'
  },
  gu: {
    name: '\u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0'
  },
  he: {
    name: '\u05E2\u05B4\u05D1\u05B0\u05E8\u05B4\u05D9\u05EA'
  },
  hi: {
    name: '\u0939\u093f\u0928\u094d\u0926\u0940'
  },
  hr: {
    name: 'hrvatski'
  },
  hu: {
    name: 'magyar nyelv'
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
  kn: {
    name: '\u0C95\u0CA8\u0CCD\u0CA8\u0CA1'
  },
  ko: {
    name: '\ud55c\uad6d\uc5b4'
  },
  la: {
    name: 'Lat\u012Bna'
  },
  lt: {
    name: 'lietuvi\u0173 kalba'
  },
  lv: {
    name: 'latvie\u0161u valoda'
  },
  ml: {
    name: '\u0D2E\u0D32\u0D2F\u0D3E\u0D33\u0D02'
  },
  mr: {
    name: '\u092E\u0930\u093E\u0920\u0940'
  },
  ms: {
    name: 'Bahasa Melayu'
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
    name: 'portugu\xEAs'
  },
  ro: {
    name: 'limba rom\xE2n\u0103'
  },
  ru: {
    name: '\u0420\u0443\u0441\u0441\u043A\u0438\u0439 \u044F\u0437\u044B\u043A'
  },
  sk: {
    name: 'sloven\u010Dina'
  },
  sl: {
    name: 'slovenski jezik'
  },
  sr: {
    name: '\u0441\u0440\u043F\u0441\u043A\u0438 \u0458\u0435\u0437\u0438\u043A'
  },
  sv: {
    name: 'Svenska'
  },
  sw: {
    name: 'Kiswahili'
  },
  ta: {
    name: '\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD'
  },
  te: {
    name: '\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41'
  },
  th: {
    name: '\u0E20\u0E32\u0E29\u0E32\u0E44\u0E17\u0E22'
  },
  tr: {
    name: 'T\xFCrk\xE7e'
  },
  ug: {
    name: '\u0626\u06C7\u064A\u063A\u06C7\u0631 \u062A\u0649\u0644\u0649'
  },
  uk: {
    name: '\u0423\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0430 \u043C\u043E\u0432\u0430'
  },
  vi: {
    name: 'Ti\u1EBFng Vi\u1EC7t'
  },
  zh: {
    name: '\u4E2D\u6587\u7B80\u4F53',
    ok: '\u786E\u5B9A',
    cancel: '\u53D6\u6D88',
    total: '\u603B\u8BA1',
    sw_context_translate: '\u7FFB\u8BD1\u6587\u672C',
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
    settings_detect_lang: '\u68C0\u6D4B\u5230\u6D4F\u89C8\u5668\u8BED\u8A00 "{}", \u8BF7\u518D\u6B21\u68C0\u67E5\u5E76\u9009\u62E9\u6B63\u786E\u7684\u76EE\u6807\u8BED\u8A00\u9009\u9879',
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
    name: '\u4E2D\u6587\u6B63\u9AD4',
    ok: '\u78BA\u5B9A',
    cancel: '\u53D6\u6D88',
    total: '\u7E3D\u8A08',
    sw_context_translate: '\u7FFB\u8B6F\u6587\u672C',
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
    settings_detect_lang: '\u6AA2\u6E2C\u5230\u6D4F\u89BD\u5668\u8A9E\u8A00 "{}", \u8ACB\u518D\u6B21\u6AA2\u67E5\u4E26\u9078\u64C7\u6B63\u78BA\u7684\u76EE\u6A19\u8A9E\u8A00\u9078\u9805',
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
  zh_tw: 'zh-TW'
};
