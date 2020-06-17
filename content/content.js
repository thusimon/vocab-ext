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
  chrome.runtime.sendMessage({ type, data }, (resp) => {
    if (callback) {
      callback(resp);
    }
  });
}

const TRANSLATE_ID = '13eaeb3e-aeb5-11ea-b3de-0242ac130004';
const TRANSLATE_IFRAME_ID = `${TRANSLATE_ID}-iframe`;

window.addEventListener('message', (evt) => {
  if (evt.origin != modalUriParsed.origin || !translateE || !evt.data) {
    return;
  }
  switch (evt.data.type) {
    case `${TRANSLATE_IFRAME_ID}-getTranslation`: {
      translateE.contentWindow.postMessage({
        type: `${TRANSLATE_IFRAME_ID}-sendTranslation`,
        data: translateResult
      }, '*')
      break;
    }
    case `${TRANSLATE_IFRAME_ID}-setWith`: {
      const translationWidth = evt.data.data ? evt.data.data : 60;
      translateE.width = translationWidth + 50;
      setDomStyles(translateE, 'opacity', '1');
      break;
    }
    case `${TRANSLATE_IFRAME_ID}-add-btn-clicked`: {
      addToVocabulary(translateResult);
      break;
    }
    default:
      break;
  }
}, false);

const getContainer = () => {
  let containerE = document.getElementById(`${TRANSLATE_ID}-vocab-container`);
  if (containerE) {
    return containerE
  }
  containerE = document.createElement('div');
  containerE.id = `${TRANSLATE_ID}-vocab-container`;
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
  const {x: containerX, y: containerY} = containerE.getBoundingClientRect();
  translateE = document.createElement('iframe');
  const offSetContainerX = contextClientX - containerX;
  const offSetContainerY = contextClientY - containerY;
  translateE.id = `${TRANSLATE_ID}-vocab-translate`;
  translateE.width = 100;
  translateE.height =40;
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

  setDomStyles(translateE, 'left', `${offSetContainerX}px`);
  setDomStyles(translateE, 'top', `${offSetContainerY-60}px`);

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
      break;
    }
    default:
      break;
  }
});