const processDictResult = (dictContainerE, dictE, dicts) => {
  if (dicts && dicts.length > 0) {
    dictContainerE.classList.remove('hide');
    dicts.forEach(dict => {
      const dictEntry = document.createElement('div');
      dictEntry.classList.add('dict-entry')
      const pos = dict.pos;
      const terms = (dict.terms || []).join(', ')
      dictEntry.textContent = `[${pos}]: ${terms}`;
      dictE.appendChild(dictEntry);
    });
  }
}

window.addEventListener('DOMContentLoaded', (event) => {
  const translatedContainerE = document.getElementById('translate-container');
  const sentenceE = document.getElementById('sentence');
  const dictCE = document.getElementById('dict-container');
  const dictE = document.getElementById('dict');
  const closeBtn = document.getElementById('close-btn');
  window.addEventListener('message', (evt) => {
    if (!evt.data || !evt.data.data) {
      return;
    }
    switch (evt.data.type) {
      case FRAME_EVENT_TYPE.SEND_CARD: {
        const data = evt.data.data;
        sentenceE.textContent = `${data.original}: ${data.translation}`;
        processDictResult(dictCE, dictE, data.dict);
        const containerWidth = translatedContainerE.offsetWidth;
        const containerHeight = translatedContainerE.offsetHeight;
        window.parent.postMessage({
          type: FRAME_EVENT_TYPE.SET_CARD_SIZE,
          data: {
            width: containerWidth,
            height: containerHeight
          }
        }, '*');
        break;
      }
      default:
        break;
    }
  }, false);
  window.parent.postMessage({
    type: FRAME_EVENT_TYPE.GET_CARD
  }, '*');

  closeBtn.addEventListener('click', () => {
    window.parent.postMessage({
      type: FRAME_EVENT_TYPE.CLOSE_CARD_MODAL
    }, '*');
  });
});




