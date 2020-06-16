let contextClientX
  , contextClientY;

document.addEventListener('contextmenu', (evt) => {
  contextClientX = evt.clientX;
  contextClientY = evt.clientY;
  getContainer();
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
  const translateE = document.createElement('iframe');
  const offSetContainerX = contextClientX - containerX;
  const offSetContainerY = contextClientY - containerY;
  translateE.id = `${TRANSLATE_ID}-vocab-translate`;
  translateE.width = 100;
  translateE.height =40;
  translateE.src = 'about:blank';
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
  
  
  const translateContent = document.createElement('span');
  translateContent.textContent = translate.translatedText;
  translateContent.title = translate.translatedText;
  setDomStyles(translateContent, 'margin', '0px 0px 0px 6px');
  setDomStyles(translateContent, 'padding', '0px',);
  setDomStyles(translateContent, 'font-size', '16px');
  setDomStyles(translateContent, 'font-weight', '600');
  setDomStyles(translateContent, 'line-height', '40px');
  setDomStyles(translateContent, 'vertical-align', 'middle');
  setDomStyles(translateContent, 'user-select', 'none');
  setDomStyles(translateContent, 'white-space', 'nowrap');

  const addBtn = document.createElement('button');
  addBtn.textContent = '+';
  addBtn.title = 'Add to vocabulary';

  const addBtnClickHandler = (evt) => {
    addBtn.removeEventListener('click', addBtnClickHandler);
    addToVocabulary(translate);
  }
  addBtn.addEventListener('click', addBtnClickHandler, true);
  setDomStyles(addBtn, 'width', '20px' );
  setDomStyles(addBtn, 'height', '20px' );
  setDomStyles(addBtn, 'margin', '0px 6px 0px 6px' );
  setDomStyles(addBtn, 'padding', '0px' );
  setDomStyles(addBtn, 'border', '1px #e0e0e0 solid' );
  setDomStyles(addBtn, 'border-radius', '10px' );
  setDomStyles(addBtn, 'background', 'rgba(127, 219, 255, 1)' );
  setDomStyles(addBtn, 'color', '#101010' );
  setDomStyles(addBtn, 'font-size', '16px' );
  setDomStyles(addBtn, 'font-weight', '600' );
  setDomStyles(addBtn, 'line-height', '0px' );
  setDomStyles(addBtn, 'vertical-align', 'middle' );
  setDomStyles(addBtn, 'outline', '0' );
  setDomStyles(addBtn, 'cursor', 'pointer');

  setDomStyles(translateE, 'left', `${offSetContainerX}px`);
  setDomStyles(translateE, 'top', `${offSetContainerY-60}px`);
  containerE.append(translateE);

  const iframeDoc = translateE.contentWindow.document;
  setDomStyles(iframeDoc.body, 'overflow', 'hidden');
  setDomStyles(iframeDoc.body, 'margin', '0px');
  setDomStyles(iframeDoc.body, 'padding', '0px');
  iframeDoc.body.append(translateContent)
  iframeDoc.body.append(addBtn);
  translateE.width = translateContent.offsetWidth+40;
}

window.document.addEventListener('iframeClicked', handleEvent, false)
function handleEvent(e) {
  console.log('parent', e) // outputs: {foo: 'bar'}
}
const cleanTranslate = () => {
  const containerE = getContainer();
  containerE.textContent = '';
}

chrome.runtime.onMessage.addListener((request, sender) => {
  const {type, data} = request;
  if (!type) {
    return;
  }
  switch (type) {
    case 'getTranslate': {
      showTranslate(data);
      break;
    }
    case 'translateError': {
      break;
    }
    default:
      break;
  }
});