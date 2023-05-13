import '@webcomponents/custom-elements';
import {
  DOM_ID, RUNTIME_EVENT_TYPE, CARD_CSS_CHECK_TIMEOUT, STORAGE_AREA,
  DEFAULT_SETTING
} from '../common/constants';
import { storageGetP, setDomStyles, sendMessage, debounce } from '../common/utils';
import TranslateModal from './TranslateModal';

(async () => {
let contextClientX;
let contextClientY;
let cardClearTimer;

document.addEventListener('contextmenu', evt => {
  contextClientX = evt.clientX;
  contextClientY = evt.clientY;
  // service worker becomes inactive after 30s, as a result, chrome.contextMenus.onClicked is not triggered
  // send a simple message to re-activate service worker
  sendMessage('SYN', {}, () => {});
  cleanTranslate();
}, true);

document.addEventListener('click', () => {
  cleanTranslate();
}, false);

const getContainer = () => {
  let containerE = document.getElementById(DOM_ID.CONTAINER);
  if (containerE) {
    return containerE
  }
  containerE = document.createElement('div');
  containerE.id = DOM_ID.CONTAINER;
  setDomStyles(containerE, 'width', '0px');
  setDomStyles(containerE, 'height', '0px');
  setDomStyles(containerE, 'position', 'relative');
  document.body.append(containerE);
  return containerE;
};

const getTranslateModal = (): TranslateModal => {
  const containerE = getContainer();
  let translateModal = document.getElementById(DOM_ID.TRANSLATE_MODAL);
  if (!translateModal) {
    translateModal = document.createElement('translate-modal');
    translateModal.id = DOM_ID.TRANSLATE_MODAL;
    containerE.append(translateModal);
  }
  return translateModal as TranslateModal;
}

const showTranslate = ({type, data}) => {
  const translateE = getTranslateModal();
  if (!translateE) {
    return;
  }
  const containerE = getContainer();
  const {x: containerX, y: containerY} = containerE.getBoundingClientRect();
  const offSet = {
    offSetContainerX: contextClientX - containerX,
    offSetContainerY: contextClientY - containerY
  }
  translateE.show(type, data, offSet);
}

const cleanTranslate = () => {
  const translateE = getTranslateModal();
  if (translateE) {
    translateE.hide();
  }
}

const showCard = (cardData, cardTime) => {
  const containerE = getContainer();
  const translateE = getTranslateModal();
  if (!containerE || !translateE) {
    return;
  }
  if (cardClearTimer) {
    clearTimeout(cardClearTimer);
  }
  translateE.show(RUNTIME_EVENT_TYPE.CARD_TRANSLATION, cardData, {});

  if (cardTime > 0) {
    cardClearTimer = setTimeout(() => {
      cleanTranslate();
    }, cardTime*1000);
  }
}

const showCardRandom = (vocabsWithSetting, cardTime) => {
  // randomly select a vocab
  const vocabsKey = Object.keys(vocabsWithSetting);
  if (vocabsKey.length < 1) {
    return;
  }
  const idx = Math.round(Math.random() * (vocabsKey.length -1));
  const key = vocabsKey[idx];
  const translateResult = vocabsWithSetting[key]; 
  const cardData = {
    originalText: key,
    translatedText: translateResult.translation,
    dictResult: translateResult.dict
  };
  showCard(cardData, cardTime);
}

const getCardTriggerElem = async (cardCss): Promise<HTMLElement> => {
  const timeOutToGetElem = (currentTime, resolve, reject) => {
    const cardElem: HTMLElement = document.querySelector(cardCss);
    if (cardElem) {
      resolve(cardElem);
    } else if (Date.now() < currentTime + CARD_CSS_CHECK_TIMEOUT) {
      setTimeout(() => {
        timeOutToGetElem(currentTime, resolve, reject);
      }, 1000);
    } else {
      reject(`no element ${cardCss} after ${CARD_CSS_CHECK_TIMEOUT} ms`)
    }
  }
  return new Promise((resolve, reject) => {
    timeOutToGetElem(Date.now(), resolve, reject);
  })
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  const {type, data} = request;
  if (!type) {
    return;
  }
  switch (type) {
    case RUNTIME_EVENT_TYPE.LOAD_TRANSLATION:
    case RUNTIME_EVENT_TYPE.GET_TRANSLATION:
    case RUNTIME_EVENT_TYPE.ERROR_TRANSLATION: {
      showTranslate({ type, data });
      sendResponse(true);
      break;
    }
    default:
      break;
  }
});

// Define the new element
window.customElements.define('translate-modal', TranslateModal);

const vocabContainer = getContainer();
const translateE = getTranslateModal();

const {SOURCE_LANG, TARGET_LANG, ENABLE_CARD, CARD_TIME, CARD_TRIGGER_CSS, ENABLE_SIDEBAR} = await storageGetP(STORAGE_AREA.SETTINGS, DEFAULT_SETTING);
if (ENABLE_CARD && window.self === window.top) {
  const vocabs = await storageGetP(STORAGE_AREA.VOCAB, {});
  const vocabTranslateArea = `${SOURCE_LANG}-${TARGET_LANG}`;
  const vocabsWithSetting = vocabs[vocabTranslateArea] || {};
  const cardTimeInt = parseInt(CARD_TIME as unknown as string);
  
  showCardRandom(vocabsWithSetting, cardTimeInt);

  if (!CARD_TRIGGER_CSS) {
    return;
  }
  
  getCardTriggerElem(CARD_TRIGGER_CSS)
  .then((cardTriggerElem) => {
    cardTriggerElem.addEventListener('click', () => {
      showCardRandom(vocabsWithSetting, cardTimeInt);
    });
  })
  .catch((err) => {
    // do not log in content script
    // TODO: log in service-worker
  });
}

if (ENABLE_SIDEBAR) {
  document.addEventListener('selectionchange', debounce(()=>{
    const selectionText = window.getSelection().toString();
    if(!selectionText) {
      return;
    }
    sendMessage('SELECTED_TEXT', {selectionText}, () => {});
  }, 300));
}


})();
