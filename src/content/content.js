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

const getTranslateModal = () => {
  let translateModal = document.getElementById(DOM_ID.TRANSLATE_MODAL);
  if (!translateModal) {
    translateModal = document.createElement('translate-modal');
    translateModal.id = DOM_ID.TRANSLATE_MODAL;
  }
  return translateModal;
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
  //translateE = getIframe();
  translateE = getTranslateModal();
  //translateE.width = 100;
  //translateE.height =40;
  //setDomStyles(translateE, 'margin', '0px');
  //setDomStyles(translateE, 'padding', '0px');
  setDomStyles(translateE, 'position', 'absolute');
  //setDomStyles(translateE, 'background', 'rgba(242, 242, 242, 1)');
  //setDomStyles(translateE, 'border', '1px #e0e0e0 solid');
  //setDomStyles(translateE, 'border-radius', '5px');
  //setDomStyles(translateE, 'box-shadow', '3px 3px 3px #e0e0e0');
  //setDomStyles(translateE, 'color', 'black');
  setDomStyles(translateE, 'z-index', '2147483647');
  //setDomStyles(translateE, 'opacity', '0');
  //setDomStyles(translateE, 'max-width', '600px');
  setDomStyles(translateE, 'top', '-500px');
  setDomStyles(translateE, 'left', '500px');

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

class TranslateModal extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({mode: 'open'});
    shadow.innerHTML = `
    <style>
      body {
        overflow: hidden;
        margin: 0px;
        padding: 0px;
      }
      
      table td {
        vertical-align: top;
      }
      #translate-container {
        margin: 0px;
        padding: 0px;
        width: 200px;
        background: rgba(242, 242, 242, 1);
        border: 1px #e0e0e0 solid;
        border-radius: 5px;
        box-shadow: 3px 3px 3px #e0e0e0;
        color: black;
      }
      
      #translate-header {
        width: 100%;
        height: 16px;
        background: #004AAD;
      }
      
      #close-btn {
        margin: 0px 2px;
        float: right;
      }
      
      #close-btn > svg {
        fill: #F0F0F0;
      }
      
      #close-btn:hover {
        cursor: pointer;
      }
      
      #close-btn:hover > svg {
        fill: #FEFEFE
      }
      
      #translate-content {
        margin: 0px 6px;
        padding: 0px;
        font-size: 12px;
        vertical-align: middle;
        user-select: none;
      }
      
      .translation-svg-icon {
        margin: 4px 0px 0px 0px;
      }
      
      .translate-entry {
        margin:4px 0px;
      }
      
      .translate-seperate-line {
        border-bottom: 1px solid #707070;
        width: 100%;
        margin: 2px 0px;
      }
      
      #sentence {
        font-size: 16px;
        max-width: 600px;
        white-space: normal;
        font-weight: 600;
      }
      
      #dict {
        font-size: 12px;
        font-weight: 600;
      }
      
      #examples {
        font-size: 12px;
        font-weight: 400;
      }
      
      .error {
        background-color: lightpink;
        text-align: center;
      }
      
      button {
        width: 20px;
        height: 20px;
        margin: 0px 8px;
        padding: 0px;
        border: none;
        border-radius: 10px;
        vertical-align: middle;
        outline: 0;
        cursor: pointer;
      }
      
      button svg:hover {
        stroke: #2699FB;
      }
      #translate-button-group {
        margin: 10px 5px;
        text-align: right;
      }
      
      .hide {
        display: none;
      }
    </style>
    <div id="translate-container">
      <div id="translate-header">
        <span id="close-btn">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14">
            <path d="M0 0h24v24H0z" fill="none"/>
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </span>
      </div>
      <div id="translate-content">
        <div id="sentence-container" class="translate-entry">
          <table>
            <tbody>
              <tr>
                <td title="Translation">
                  <div class="translation-svg-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15px" height="15px" viewBox="0 0 20 15">
                      <g id="Icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                          <g id="Rounded" transform="translate(-272.000000, -2062.000000)">
                              <g id="Editor" transform="translate(100.000000, 1960.000000)">
                                  <g id="Round--Editor--text--fields" transform="translate(170.000000, 98.000000)">
                                      <g>
                                          <polygon id="Path" points="0 0 24 0 24 24 0 24"></polygon>
                                          <path d="M2.5,5.5 C2.5,6.33 3.17,7 4,7 L7.5,7 L7.5,17.5 C7.5,18.33 8.17,19 9,19 C9.83,19 10.5,18.33 10.5,17.5 L10.5,7 L14,7 C14.83,7 15.5,6.33 15.5,5.5 C15.5,4.67 14.83,4 14,4 L4,4 C3.17,4 2.5,4.67 2.5,5.5 Z M20,9 L14,9 C13.17,9 12.5,9.67 12.5,10.5 C12.5,11.33 13.17,12 14,12 L15.5,12 L15.5,17.5 C15.5,18.33 16.17,19 17,19 C17.83,19 18.5,18.33 18.5,17.5 L18.5,12 L20,12 C20.83,12 21.5,11.33 21.5,10.5 C21.5,9.67 20.83,9 20,9 Z" id="translate-icon-color" fill="#004AAD"></path>
                                      </g>
                                  </g>
                              </g>
                          </g>
                      </g>
                    </svg>
                  </div>
                </td>
                <td>
                  <div id="sentence"></div>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="translate-seperate-line"></div>
        </div>
        <div id="dict-container" class="translate-entry hide">
          <table>
            <tbody>
              <tr>
                <td title="Dictionary">
                  <div class="translation-svg-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14px" height="14px" viewBox="0 0 24 24" fill="none" stroke="#004AAD" stroke-width="3">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                  </div>
                </td>
                <td>
                  <div id="dict"></div>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="translate-seperate-line"></div>
        </div>
        <div id="synsets-container" class="translate-entry hide">
          <div id="synsets"></div>
        </div>
        <div id="examples-container" class="translate-entry hide">
          <table>
            <tbody>
              <tr>
                <td title="Examples">
                  <div class="translation-svg-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14px" height="14px" viewBox="0 0 24 24" fill="none" stroke="#004AAD" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="8" y1="6" x2="21" y2="6"></line>
                      <line x1="8" y1="12" x2="21" y2="12"></line>
                      <line x1="8" y1="18" x2="21" y2="18"></line>
                      <line x1="3" y1="6" x2="3" y2="6"></line>
                      <line x1="3" y1="12" x2="3" y2="12"></line>
                      <line x1="3" y1="18" x2="3" y2="18"></line>
                    </svg>
                  </div>
                </td>
                <td>
                  <div id="examples"></div>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="translate-seperate-line"></div>
        </div>
      </div>
      <div id="translate-button-group">
        <button id="read-vocab-button" title="Read vocabulary">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" stroke-width="3" stroke="#004AAD">
            <polyline points="10,21 3,21 3,11 10,11 " />
            <polyline points="10,11 20,3.8 20,28.2 10,21 "/>
            <g>
              <path d="M26.4,22c1.6-1.5,2.6-3.6,2.6-6c0-2.4-1-4.5-2.6-6"/>
            </g>
            <g>
              <path d="M24,18.6c0.7-0.7,1.2-1.6,1.2-2.6s-0.4-2-1.2-2.6"/>
            </g>
          </svg>
        </button>
        <button id="add-vocab-button" title="Add to vocabulary">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke="#004AAD">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
        </button>
      </div>
    </div>
    `;
  }
}

// Define the new element
window.customElements.define('translate-modal', TranslateModal);
