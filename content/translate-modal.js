window.addEventListener('DOMContentLoaded', (event) => {
  const translatedContentE = document.getElementById('translate-content');
  window.addEventListener('message', (evt) => {
    if (!evt.data || !evt.data.data) {
      return;
    }
    switch (evt.data.type) {
      case FRAME_EVENT_TYPE.SEND_TRANSLATION: {
        translatedText = evt.data.data.translatedText;
        translatedContentE.textContent = translatedText;
        translatedContentE.title = translatedText;
        const translationWidth = translatedContentE.offsetWidth;
        window.parent.postMessage({
          type: FRAME_EVENT_TYPE.SET_WIDTH,
          data: translationWidth
        }, '*');
        break;
      }
      default:
        break;
    }
  }, false);
  window.parent.postMessage({
    type: FRAME_EVENT_TYPE.GET_TRANSLATION
  }, '*');

  const addBtn = document.getElementById('add-vocab-button');
  addBtn.addEventListener('click', () => {
    window.parent.postMessage({
      type: FRAME_EVENT_TYPE.CLICK_ADD_BTN
    }, '*');
  });
});



