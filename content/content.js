let contextClientX
  , contextClientY
  , translateE
  , translateResult;

const modalUri = chrome.extension.getURL('content/translate-modal.html');
const modalUriParsed = new URL(modalUri);

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
  if (evt.origin != modalUriParsed.origin || !translateE || !evt.data) {
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
    case FRAME_EVENT_TYPE.SET_SIZE: {
      const containerE = getContainer();
      const {x: containerX, y: containerY} = containerE.getBoundingClientRect();
      const offSetContainerX = contextClientX - containerX;
      const offSetContainerY = contextClientY - containerY;
      const translationWidth = evt.data.data ? evt.data.data.width : 60;
      const translationHeight = evt.data.data ? evt.data.data.height : 40;
      translateE.width = translationWidth;
      //TODO the height is not accurate, give it more buffer
      translateE.height = translationHeight + 30;
      setDomStyles(translateE, 'width', translationWidth + 'px');
      setDomStyles(translateE, 'height', translationHeight + 30 + 'px');
      setDomStyles(translateE, 'left', `${offSetContainerX}px`);
      setDomStyles(translateE, 'top', `${offSetContainerY-translationHeight-50}px`);
      setDomStyles(translateE, 'opacity', '1');
      break;
    }
    case FRAME_EVENT_TYPE.CLICK_ADD_BTN: {
      addToVocabulary(translateResult);
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
  translateE.id = DOM_ID.IFRAME;
  //translateE.width = 100;
  //translateE.height =40;
  translateE.src = modalUri;
  setDomStyles(translateE, 'margin', '0px');
  setDomStyles(translateE, 'padding', '0px');
  setDomStyles(translateE, 'position', 'absolute');
  setDomStyles(translateE, 'background', 'rgba(242, 242, 242, 1)');
  setDomStyles(translateE, 'border', '1px #e0e0e0 solid');
  setDomStyles(translateE, 'border-radius', '4px');
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
  while (containerE.firstChild) {
    containerE.removeChild(containerE.lastChild);
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