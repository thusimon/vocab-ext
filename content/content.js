(async () => {
let contextClientX
  , contextClientY
  , translateE
  , translateResult
  , cardE
  , cardData
  , cardPositionTimer;

const modalTranslateUri = chrome.extension.getURL('content/translate-modal.html');
const modalCardUri = chrome.extension.getURL('content/card-modal.html');
const modalTranslateUriParsed = new URL(modalTranslateUri);

document.addEventListener('contextmenu', (evt) => {
  contextClientX = evt.clientX;
  contextClientY = evt.clientY;
  cleanTranslate();
  sendMessage('onContextMenuShow', {}, () => {});
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
  if (evt.origin != modalTranslateUriParsed.origin || (!translateE && !cardE) || !evt.data) {
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
}

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
  translateE = document.createElement('iframe');
  translateE.id = DOM_ID.TRANSLATE_IFRAME;
  //translateE.width = 100;
  //translateE.height =40;
  translateE.src = modalTranslateUri;
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

let {SOURCE_LANG, TARGET_LANG, ENABLE_CARD, CARD_TIME} = await storageGetP(STORAGE_AREA.SETTINGS, DEFAULT_SETTING);
if (ENABLE_CARD && window.self === window.top) {
  vocabs = await storageGetP(STORAGE_AREA.VOCAB);
  const vocabTranslateArea = `${SOURCE_LANG}-${TARGET_LANG}`;
  const vocabsWithSetting = vocabs[vocabTranslateArea] || {};
  // randomly select a vocab
  const vocabsKey = Object.keys(vocabsWithSetting);
  if (vocabsKey.length > 0) {
    const idx = Math.round(Math.random() * (vocabsKey.length -1));
    const key = vocabsKey[idx];
    cardData = {...{original: key}, ...vocabsWithSetting[key]}
    showCard(parseInt(CARD_TIME));
  }
}

})();
