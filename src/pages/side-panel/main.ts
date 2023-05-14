import TranslateAPI from "../../background/translate-api";
import { DEFAULT_SETTING, STORAGE_AREA } from "../../common/constants";
import { storageGetP } from "../../common/utils";

const translateAPI = new TranslateAPI();

const _doTranslate = async (text: string) => {
  if (!text) {
    return;
  }
  text = text.trim().toLowerCase();
  if (!text) {
    return;
  }
  const settings = await storageGetP(STORAGE_AREA.SETTINGS, DEFAULT_SETTING);
  const {SOURCE_LANG, TARGET_LANG} = settings;
  try {
    const translateRes = await translateAPI.translateFree(encodeURIComponent(text), SOURCE_LANG, TARGET_LANG);
    return translateRes;
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }
}

chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  const {type, data} = msg;
  if (!type) {
    return;
  }
  switch (type) {
    case 'SELECTED_TEXT': {
      const translateResult = await _doTranslate(data.selectionText)
      console.log(10, translateResult);
      break;
    }
  }
});
