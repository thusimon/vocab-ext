(async () => {

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
  CARD_IFRAME: `${TRANSLATE_ID}-vocab-card`
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
};


const storageGetP = (key, defaultValue) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (value) => {
      let storageValue;
      if (!value || !value[key]) {
        storageValue = {};
      } else {
        storageValue = value[key];
      }
      storageValue = Object.assign({}, defaultValue, storageValue);
      resolve(storageValue);
    });
  });
};

const storageSetP = (key, value) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({[key]: value}, () => {
      resolve();
    });
  });
};

const removeAllChildNodes = (parent) => {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
};


let contextClientX
  , contextClientY
  , translateE
  , translateResult
  , cardE
  , cardData
  , cardPositionTimer;

const modalTranslateUri = chrome.runtime.getURL('content/translate-modal.html');
const modalCardUri = chrome.runtime.getURL('content/card-modal.html');
const modalTranslateUriParsed = new URL(modalTranslateUri);

document.addEventListener('contextmenu', (evt) => {
  contextClientX = evt.clientX;
  contextClientY = evt.clientY;
  cleanTranslate();
}, true);

document.addEventListener('click', () => {
  cleanTranslate();
}, true);

const sendMessage = (type, data, callback) => {
  if (!chrome || !chrome.runtime || !chrome.runtime.sendMessage) {
    return;
  }
  chrome.runtime.sendMessage({ type, data }, (resp) => {
    if (callback) {
      callback(resp);
    }
  });
}

window.addEventListener('message', (evt) => {
  if (evt.origin != modalTranslateUriParsed.origin
    || ((!translateE || !translateE.contentWindow) && (!cardE || !cardE.contentWindow))
    || !evt.data) {
    return;
  }
  switch (evt.data.type) {
    case FRAME_EVENT_TYPE.GET_TRANSLATION: {
      translateE.contentWindow.postMessage({
        type: FRAME_EVENT_TYPE.SEND_TRANSLATION,
        data: translateResult
      }, '*')
      break;
    }
    case FRAME_EVENT_TYPE.GET_CARD: {
      cardE.contentWindow.postMessage({
        type: FRAME_EVENT_TYPE.SEND_CARD,
        data: cardData
      }, '*');
      break;
    }
    case FRAME_EVENT_TYPE.SET_TRANSLATION_SIZE: {
      const containerE = getContainer();
      const {x: containerX, y: containerY} = containerE.getBoundingClientRect();
      const offSetContainerX = contextClientX - containerX;
      const offSetContainerY = contextClientY - containerY;
      const translationWidth = evt.data.data ? evt.data.data.width : 60;
      const translationHeight = evt.data.data ? evt.data.data.height : 40;
      translateE.width = translationWidth;
      //TODO the height is not accurate, give it more buffer
      translateE.height = translationHeight + 10;
      setDomStyles(translateE, 'width', translationWidth + 'px');
      setDomStyles(translateE, 'height', translationHeight + 10 + 'px');
      setDomStyles(translateE, 'left', `${offSetContainerX}px`);
      setDomStyles(translateE, 'top', `${offSetContainerY-translationHeight-30}px`);
      setDomStyles(translateE, 'opacity', '1');
      break;
    }
    case FRAME_EVENT_TYPE.SET_CARD_SIZE: {
      const translationWidth = evt.data.data ? evt.data.data.width : 60;
      const translationHeight = evt.data.data ? evt.data.data.height : 40;
      cardE.width = translationWidth;
      //TODO the height is not accurate, give it more buffer
      cardE.height = translationHeight + 10;
      setDomStyles(cardE, 'width', translationWidth + 'px');
      setDomStyles(cardE, 'height', translationHeight + 10 + 'px');
      setDomStyles(cardE, 'opacity', '0.95');
      break;
    }
    case FRAME_EVENT_TYPE.CLICK_ADD_BTN: {
      addToVocabulary(translateResult);
      break;
    }
    case FRAME_EVENT_TYPE.CLOSE_TRANSLATE_MODAL: {
      cleanTranslate();
      break;
    }
    case FRAME_EVENT_TYPE.CLOSE_CARD_MODAL: {
      cleanCard();
      break;
    }
    default:
      break;
  }
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

const getIframe = () => {
  let iframeE = document.getElementById(DOM_ID.TRANSLATE_IFRAME);
  if (!iframeE) {
    iframeE = document.createElement('iframe');
  }
  iframeE.id = DOM_ID.TRANSLATE_IFRAME;
  iframeE.src = modalTranslateUri;
  return iframeE;
};

const setDomStyles = (elem, prop, value) => {
  elem.style.setProperty(prop, value, 'important');
}

const addToVocabulary = (translate) => {
  sendMessage('addToVocab', translate, () => {
    cleanTranslate();
  });
}

const showTranslate = (translate) => {
  const containerE = getContainer();
  translateE = getIframe();
  //translateE.width = 100;
  //translateE.height =40;
  setDomStyles(translateE, 'margin', '0px');
  setDomStyles(translateE, 'padding', '0px');
  setDomStyles(translateE, 'position', 'absolute');
  setDomStyles(translateE, 'background', 'rgba(242, 242, 242, 1)');
  setDomStyles(translateE, 'border', '1px #e0e0e0 solid');
  setDomStyles(translateE, 'border-radius', '5px');
  setDomStyles(translateE, 'position', 'absolute');
  setDomStyles(translateE, 'box-shadow', '3px 3px 3px #e0e0e0');
  setDomStyles(translateE, 'color', 'black');
  setDomStyles(translateE, 'z-index', '2147483647');
  setDomStyles(translateE, 'opacity', '0');
  setDomStyles(translateE, 'max-width', '600px');

  containerE.append(translateE);
}

const cleanTranslate = () => {
  const containerE = getContainer();
  const translatesE = containerE.querySelectorAll(`#${DOM_ID.TRANSLATE_IFRAME}`);
  translatesE.forEach(translateE => {
    translateE.remove();
  });
}

const cleanCard = () => {
  const containerE = getContainer();
  const cardsE = containerE.querySelectorAll(`#${DOM_ID.CARD_IFRAME}`);
  cardsE.forEach(card => {
    card.remove();
  });
  if (cardPositionTimer) {
    clearInterval(cardPositionTimer);
  }
}

const positionCard = (toTopFixed, toLeftFixed) => {
  if (!cardE) {
    return;
  }
  const containerE = getContainer();
  const containerRect = containerE.getBoundingClientRect();
  setDomStyles(cardE, 'top', `-${Math.round(containerRect.top) - toTopFixed}px`);
  setDomStyles(cardE, 'left', `${toLeftFixed}px`);
}

const showCard = (cardTime) => {
  const currentCard = document.getElementById(DOM_ID.CARD_IFRAME);
  if (currentCard) {
    return;
  }
  const containerE = getContainer();
  cardE = document.createElement('iframe');
  cardE.id = DOM_ID.CARD_IFRAME;
  cardE.src = modalCardUri;

  setDomStyles(cardE, 'margin', '0px');
  setDomStyles(cardE, 'padding', '0px');
  setDomStyles(cardE, 'position', 'absolute');
  setDomStyles(cardE, 'background', 'rgba(242, 242, 242, 1)');
  setDomStyles(cardE, 'border', '1px #e0e0e0 solid');
  setDomStyles(cardE, 'border-radius', '5px');
  setDomStyles(cardE, 'position', 'absolute');
  setDomStyles(cardE, 'box-shadow', '3px 3px 3px #e0e0e0');
  setDomStyles(cardE, 'color', 'black');
  setDomStyles(cardE, 'z-index', '2147483647');
  setDomStyles(cardE, 'opacity', '0');
  setDomStyles(cardE, 'max-width', '600px');

  // compute the position, the card is now at fixed position
  // TODO allow user to drag the card
  const toTopFixed = 20;
  const toLeftFixed = 20;

  containerE.append(cardE);

  cardPositionTimer = setInterval(() => {
    positionCard(toTopFixed, toLeftFixed);
  }, 200);

  if (cardTime > 0) {
    setTimeout(() => {
      cleanCard();
      if (cardPositionTimer) {
        clearInterval(cardPositionTimer);
      }
    }, cardTime*1000);
  }
}

const showCardRandom = (vocabsWithSetting, cardTime) => {
  // randomly select a vocab
  const vocabsKey = Object.keys(vocabsWithSetting);
  if (vocabsKey.length > 0) {
    const idx = Math.round(Math.random() * (vocabsKey.length -1));
    const key = vocabsKey[idx];
    cardData = {...{original: key}, ...vocabsWithSetting[key]}
    showCard(cardTime);
  }
}

const getCardTriggerElem = async (cardCss) => {
  const timeOutToGetElem = (currentTime, resolve, reject) => {
    let cardElem = document.querySelector(cardCss);
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

chrome.runtime.onMessage.addListener((request, sender) => {
  const {type, data} = request;
  if (!type) {
    return;
  }
  switch (type) {
    case 'getTranslate': {
      translateResult = data;
      showTranslate(translateResult);
      break;
    }
    case 'translateError': {
      translateResult = {
        err: data
      }
      showTranslate(translateResult);
      break;
    }
    default:
      break;
  }
});

let {SOURCE_LANG, TARGET_LANG, ENABLE_CARD, CARD_TIME, CARD_TRIGGER_CSS} = await storageGetP(STORAGE_AREA.SETTINGS, DEFAULT_SETTING);
if (ENABLE_CARD && window.self === window.top) {
  vocabs = await storageGetP(STORAGE_AREA.VOCAB);
  const vocabTranslateArea = `${SOURCE_LANG}-${TARGET_LANG}`;
  const vocabsWithSetting = vocabs[vocabTranslateArea] || {};
  const cardTimeInt = parseInt(CARD_TIME);
  
  showCardRandom(vocabsWithSetting, cardTimeInt);

  if (CARD_TRIGGER_CSS) {
    getCardTriggerElem(CARD_TRIGGER_CSS)
    .then((cardTriggerElem) => {
      cardTriggerElem.addEventListener('click', () => {
        showCardRandom(vocabsWithSetting, cardTimeInt);
      });
    })
    .catch((err) => {
      console.log(err);
    });
  }
}


})()
