let contextClientX
  , contextClientY
  , translateResult
  , cardE
  , cardData
  , cardPositionTimer;

const modalTranslateUri = chrome.runtime.getURL('content/translate-modal.html');
const modalCardUri = chrome.runtime.getURL('content/card-modal.html');
const modalTranslateUriParsed = new URL(modalTranslateUri);


document.addEventListener('contextmenu', evt => {
  contextClientX = evt.clientX;
  contextClientY = evt.clientY;
  cleanTranslate();
}, true);

document.addEventListener('click', () => {
  cleanTranslate();
}, false);

const sendMessage = async (type, data, callback) => {
  if (!chrome || !chrome.runtime || !chrome.runtime.sendMessage) {
    return;
  }
  const resp = await chrome.runtime.sendMessage({ type, data });
  if (callback) {
    return callback(resp);
  }
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
      //cleanTranslate();
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

const addToVocabulary = async (translate) => {
  await sendMessage('addToVocab', translate, cleanTranslate);
}

const initTranslate = () => {
  const containerE = getContainer();
  const translateE = getTranslateModal();
  containerE.append(translateE);
  return translateE;
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
  const containerE = getContainer();
  const translateE = containerE.querySelector(`#${DOM_ID.TRANSLATE_MODAL}`);
  if (translateE) {
    translateE.hide();
  }
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
    case RUNTIME_EVENT_TYPE.SHOW_TRANSLATION: {
      showTranslate({ type, data });
      break;
    }
    case RUNTIME_EVENT_TYPE.GET_TRANSLATION: {
      translateResult = data;
      showTranslate({ type, data });
      break;
    }
    case RUNTIME_EVENT_TYPE.ERROR_TRANSLATION: {
      showTranslate({ type, data });
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
  static styleText = `
  #translate-container {
    overflow: hidden;
    margin: 0px;
    padding: 0px;
    width: 300px;
    background: rgba(242, 242, 242, 1);
    border: 1px #e0e0e0 solid;
    border-radius: 5px;
    box-shadow: 3px 3px 3px #e0e0e0;
    color: black;
    line-height: 1;
  }
  
  #translate-header {
    width: 100%;
    height: 16px;
    background: #004AAD;
  }

  .grab {
    cursor: grab;
  }

  .grabbing {
    cursor: grabbing;
  }
  
  #close-btn {
    margin: 1px 2px;
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

  .translate-loading {
    text-align: center;
  }

  .translate-error {
    display: flex;
    justify-content: space-between;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    display: inline-block;
    margin: 10px 10px 10px 20px;
  }

  .error-image {
    width: 40px;
    height: 40px;
    display: inline-block;
    margin: 10px 10px 10px 20px;
  }

  .error-message {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  .error-message a {
    font-size: 20px;
  }

  .error-instruction {
    width: 16px;
    height: 16px;
    display: inline-block;
    margin: 10px;
  }

  .td-icon {
    vertical-align: text-top;
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
  `;
  static headerTemplate = `
  <span id="close-btn">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14">
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
    </svg>
  </span>
  `;
  static translateTemplate = `
  <div id="sentence-container" class="translate-entry">
    <table>
      <tbody>
        <tr>
          <td title="Translation" class="td-icon">
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
          <td title="Dictionary" class="td-icon">
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
          <td title="Examples" class="td-icon">
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
  `;
  static loadingTemplate = `
  <div class="loading-spinner">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
      <path d="M10 50A40 40 0 0 0 90 50A40 45 0 0 1 10 50" fill="#004aad" stroke="none">
        <animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" keyTimes="0;1" values="0 50 52.5;360 50 52.5"></animateTransform>
      </path>
    </svg>
  </div>
  `;
  static errorTemplate = `
  <div class="error-image">
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 50 50">
      <circle style="fill:#D75A4A;" cx="25" cy="25" r="25"/>
      <polyline style="fill:none;stroke:#FFFFFF;stroke-width:2;stroke-linecap:round;stroke-miterlimit:10;" points="16,34 25,25 34,16 "/>
      <polyline style="fill:none;stroke:#FFFFFF;stroke-width:2;stroke-linecap:round;stroke-miterlimit:10;" points="16,16 25,25 34,34 "/>
    </svg>
  </div>
  <div class="error-message">
    <a id="translation-link" target="_blank">Google Translate</a>
    <div class="error-instruction">
      <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 203.079 203.079">
        <path d="M192.231,104.082V102c0-12.407-10.094-22.5-22.5-22.5c-2.802,0-5.484,0.519-7.961,1.459
          C159.665,70.722,150.583,63,139.731,63c-2.947,0-5.76,0.575-8.341,1.61C128.667,55.162,119.624,48,109.231,48
          c-2.798,0-5.496,0.541-8,1.516V22.5c0-12.407-10.094-22.5-22.5-22.5s-22.5,10.093-22.5,22.5v66.259
          c-3.938-5.029-8.673-9.412-14.169-11.671c-6.133-2.52-12.587-2.219-18.667,0.872c-11.182,5.686-15.792,19.389-10.277,30.548
          l27.95,56.563c0.79,1.552,19.731,38.008,54.023,38.008h40c31.54,0,57.199-25.794,57.199-57.506l-0.031-41.491H192.231z
            M135.092,188.079h-40c-24.702,0-40.091-28.738-40.646-29.796l-27.88-56.42c-1.924-3.893-0.33-8.519,3.629-10.532
          c2.182-1.11,4.081-1.223,6.158-0.372c8.281,3.395,16.41,19.756,19.586,29.265l2.41,7.259l12.883-4.559V22.5
          c0-4.136,3.364-7.5,7.5-7.5s7.5,3.364,7.5,7.5V109h0.136h14.864h0.136V71c0-4.187,3.748-8,7.864-8c4.262,0,8,3.505,8,7.5v15v26h15
          v-26c0-4.136,3.364-7.5,7.5-7.5s7.5,3.364,7.5,7.5V102v16.5h15V102c0-4.136,3.364-7.5,7.5-7.5s7.5,3.364,7.5,7.5v10.727h0.035
          l0.025,32.852C177.291,169.014,158.36,188.079,135.092,188.079z"/>
      </svg>
    </div>
  </div>
  `;
  static modalBottomMargin = 20;
  constructor() {
    super();
    const shadow = this.attachShadow({mode: 'open'});
    const style = document.createElement('style');
    style.append(document.createTextNode(TranslateModal.styleText));
    this.container = document.createElement('div');
    this.container.id = 'translate-container';
    this.header = document.createElement('div');
    this.header.id = 'translate-header';
    this.header.draggable = true;
    this.header.innerHTML = TranslateModal.headerTemplate;
    this.header.classList.toggle('grab', true);
    this.content = document.createElement('div');
    this.content.id = 'translate-content';

    this.loadingView = document.createElement('div');
    this.loadingView.className = 'translate-loading';
    this.loadingView.innerHTML = TranslateModal.loadingTemplate;
    this.loadingView.style.display = 'none';
    
    this.translateView = document.createElement('div');
    this.translateView.className = 'translate-data';
    this.translateView.innerHTML = TranslateModal.translateTemplate;
    this.translateView.style.display = 'none';

    this.errorView = document.createElement('div');
    this.errorView.className = 'translate-error';
    this.errorView.innerHTML = TranslateModal.errorTemplate;
    this.errorView.style.display = 'none';

    this.content.append(this.loadingView, this.translateView, this.errorView);

    this.container.append(this.header, this.content);

    shadow.append(style, this.container);
    this.addEventListener('transitionend', this.transitionHandler);
  }

  connectedCallback() {
    /**
     * setting all='initial' is important, shadowDom encapsulate the styling
     * it does not leak OUT the styling
     * however, for those inheritable styling, if not specified by shadowDom,
     * the outside style may leak IN 
     **/
    this.style.all = 'initial';
    setDomStyles(this, 'position', 'absolute');
    setDomStyles(this, 'z-index', '2147483647');
    setDomStyles(this, 'opacity', '0');
    setDomStyles(this, 'top', '0px');
    setDomStyles(this, 'left', '0px');
    setDomStyles(this, 'transition-property', 'opacity, top, left');
    setDomStyles(this, 'transition-duration', '0.5s');
    setDomStyles(this, 'transition-timing-function', 'ease-in-out');
    setDomStyles(this, 'display', 'none');
    this.setLoadingView();
    const closeBtn = this.shadowRoot.querySelector('#close-btn');
    closeBtn.addEventListener('click', evt => {
      evt.stopPropagation();
      this.hide();
    });
    const addVocabBtn = this.shadowRoot.querySelector('#add-vocab-button');
    addVocabBtn.addEventListener('click', async evt => {
      evt.stopPropagation();
      if (translateResult) {
        await addToVocabulary(translateResult);
      }
    });
    const readVocabBtn = this.shadowRoot.querySelector('#read-vocab-button');
    readVocabBtn.addEventListener('click', async evt => {
      evt.stopPropagation();
      const settings = await storageGetP(STORAGE_AREA.SETTINGS, DEFAULT_SETTING);
      const synthesis = window.speechSynthesis;
      if (!translateResult || !translateResult.originalText || synthesis.speaking) {
        return;
      }
      const utterOriginal = new SpeechSynthesisUtterance(translateResult.originalText);
      utterOriginal.lang = settings.SOURCE_LANG;
      synthesis.speak(utterOriginal);
    });
    const header = this.shadowRoot.querySelector('#translate-header');
    header.addEventListener('click', evt => {
      evt.stopPropagation();
    });

    header.addEventListener("drag", evt => {
      if (this.startDragPoint) {
        const newOffSetX = this.leftOffSet + evt.x - this.startDragPoint.x;
        const newOffSetY = this.topOffSet + evt.y - this.startDragPoint.y;
        this.setPosition(newOffSetX, newOffSetY, true);
      }
      evt.preventDefault()
    });

    header.addEventListener("dragstart", evt => {
      this.startDragPoint = {x: evt.x, y: evt.y};
      header.classList.toggle('grabbing', true);
      header.classList.toggle('grab', false);
    });

    header.addEventListener("dragend", evt => {
      header.classList.toggle('grabbing', false);
      header.classList.toggle('grab', true);
      if (this.startDragPoint) {
        const newOffSetX = this.leftOffSet + evt.x - this.startDragPoint.x;
        const newOffSetY = this.topOffSet + evt.y - this.startDragPoint.y;
        this.setPosition(newOffSetX, newOffSetY);
        this.startDragPoint = null;
      }
    });

    /* events fired on the drop targets */
    header.addEventListener("dragover", evt => {
      evt.preventDefault()
    });

    header.addEventListener("dragenter", evt => {
      evt.preventDefault();
    });

    header.addEventListener("dragleave", evt => {
      evt.preventDefault();
    });

    header.addEventListener("drop", evt => {
      evt.preventDefault();
    });
  }

  setLoadingView() {
    this.loadingView.style.display = 'block';
    this.translateView.style.display = 'none';
    this.errorView.style.display = 'none';
    return {
      width: 202,
      height: 78
    };
  }

  setTranslateView(data) {
    this.loadingView.style.display = 'none';
    this.translateView.style.display = 'block';
    this.errorView.style.display = 'none';
    const sentenceE = this.shadowRoot.getElementById('sentence');
    const dictCE = this.shadowRoot.getElementById('dict-container');
    const dictE = this.shadowRoot.getElementById('dict');
    //const synsetsCE = this.shadowRoot.getElementById('synsets-container');
    //const synsetsE = this.shadowRoot.getElementById('synsets');
    const exampleCE = this.shadowRoot.getElementById('examples-container');
    const examplesE = this.shadowRoot.getElementById('examples');

    this.translatedText = data.translatedText;
    this.originalText = data.originalText;
    sentenceE.textContent = this.translatedText;
    this.processDictResult(dictCE, dictE, data.dictResult);
    //this.processSynsets(synsetsCE, synsetsE, data.synsets);
    this.processExamples(exampleCE, examplesE, data.exampleRes);
    return {
      width: this.container.offsetWidth,
      height: this.container.offsetHeight
    };
  }

  setErrorView(data) {
    console.log(data);
    const url = data.url;
    this.loadingView.style.display = 'none';
    this.translateView.style.display = 'none';
    this.errorView.style.display = 'flex';
    const instructionLink = this.shadowRoot.getElementById('translation-link');
    if (instructionLink) {
      instructionLink.href = url;
    }
    return {
      width: 202,
      height: 78
    };
  }

  setPosition(offSetX, offSetY, isTempPosition) {
    if (!isTempPosition) {
      this.leftOffSet = offSetX;
      this.topOffSet = offSetY;
    }
    setDomStyles(this, 'left', `${offSetX}px`);
    setDomStyles(this, 'top', `${offSetY}px`);
  }

  processDictResult(dictContainerE, dictE, dicts) {
    removeAllChildNodes(dictE);
    if (dicts && dicts.length > 0) {
      dictContainerE.className = 'translate-entry';
      dicts.forEach(dict => {
        const dictEntry = document.createElement('div');
        dictEntry.classList.add('dict-entry')
        const pos = dict.pos;
        const terms = (dict.terms || []).join(', ')
        dictEntry.textContent = `[${pos}]: ${terms}`;
        dictE.appendChild(dictEntry);
      });
    } else {
      dictContainerE.className = 'translate-entry hide';
    }
  }

  processSynsets(synsetsContainerE, synsetsE, synsets) {
    removeAllChildNodes(synsetsE);
    if (synsets && synsets.length > 0) {
      synsetsContainerE.className = 'translate-entry';
      synsets.forEach(synset => {
        const synsetEntry = document.createElement('div');
        synsetEntry.classList.add('synset-entry')
        const pos = synset.pos;
        const entry = synset.entry
        if (entry && entry.length > 0){
          // here only get the first one
          const synonym = (entry[0].synonym || []).join(', ')
          synsetEntry.textContent = `[${pos}]: ${synonym}`;
          synsetsE.appendChild(synsetEntry);
        }
      })
    } else {
      synsetsContainerE.className = 'translate-entry hide';
    }
  }

  processExamples(exampleContainerE, examplesE, examples) {
    removeAllChildNodes(examplesE);
    if (examples && examples.length > 0) {
      exampleContainerE.className = 'translate-entry';
      // take only the first two
      const lessExamples = examples.slice(0, 2);
      const domParser = new DOMParser();
      lessExamples.forEach((example, idx) => {
        const exampleEntry = document.createElement('div');
        exampleEntry.classList.add('example-entry');
        const exampleText = example.text || '';
        const exampleTextParsed = domParser.parseFromString(`<span>${idx+1}. ${exampleText}</span>`, 'text/html');
        exampleEntry.append(exampleTextParsed.body.firstElementChild);
        examplesE.appendChild(exampleEntry);
      });
    } else {
      exampleContainerE.className = 'translate-entry hide';
    }
  }

  show(type, data, offSet) {
    this.style.opacity = 1;
    this.style.display = 'block';
    switch (type) {
      case RUNTIME_EVENT_TYPE.SHOW_TRANSLATION: {
        const viewSize = this.setLoadingView();
        this.setPosition(offSet.offSetContainerX, offSet.offSetContainerY - viewSize.height - TranslateModal.modalBottomMargin);
        break;
      }
      case RUNTIME_EVENT_TYPE.GET_TRANSLATION: {
        const viewSize = this.setTranslateView(data);
        this.setPosition(offSet.offSetContainerX, offSet.offSetContainerY - viewSize.height - TranslateModal.modalBottomMargin);
        break;
      }
      case RUNTIME_EVENT_TYPE.ERROR_TRANSLATION: {
        const viewSize = this.setErrorView(data);
        this.setPosition(offSet.offSetContainerX, offSet.offSetContainerY - viewSize.height - TranslateModal.modalBottomMargin);
        break;
      }
      default:
        break;
    }
  }

  hide() {
    this.style.opacity = 0;
  }

  transitionHandler(e) {
    if (e.propertyName === 'opacity' && this.style.opacity ==='0') {
      this.style.display = 'none';
    }
  }

}

// Define the new element
window.customElements.define('translate-modal', TranslateModal);

const vocabContainer = getContainer();
const translateE = initTranslate();