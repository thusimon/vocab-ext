let originalText
  , translatedText

window.addEventListener('DOMContentLoaded', (event) => {
  const translatedContentE = document.getElementById('translate-content');
  const addBtn = document.getElementById('add-vocab-button');
  const readBtn = document.getElementById('read-vocab-button');
  window.addEventListener('message', (evt) => {
    if (!evt.data || !evt.data.data) {
      return;
    }
    switch (evt.data.type) {
      case FRAME_EVENT_TYPE.SEND_TRANSLATION: {
        const data = evt.data.data;
        if (data.err) {
          // should hide the buttons and only show the error
          translatedContentE.textContent = `Error: ${data.err}`;
          translatedContentE.title = 'Error';
          document.body.classList.add('error');
          addBtn.classList.add('hide');
          readBtn.classList.add('hide');
        } else {
          translatedText = data.translatedText;
          originalText = data.originalText;
          translatedContentE.textContent = translatedText;
          translatedContentE.title = translatedText;
        }
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

  addBtn.addEventListener('click', () => {
    window.parent.postMessage({
      type: FRAME_EVENT_TYPE.CLICK_ADD_BTN
    }, '*');
  });

  readBtn.addEventListener('click', async () => {
    const settings = await storageGetP(STORAGE_AREA.SETTINGS, DEFAULT_SETTING);
    const synthesis = window.speechSynthesis;
    if (!originalText || synthesis.speaking) {
      return;
    }
    const utterOriginal = new SpeechSynthesisUtterance(originalText);
    utterOriginal.lang = settings.SOURCE_LANG;
    synthesis.speak(utterOriginal);
  })
});



