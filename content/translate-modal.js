const TRANSLATE_IFRAME_ID = '13eaeb3e-aeb5-11ea-b3de-0242ac130004-iframe';

window.addEventListener('DOMContentLoaded', (event) => {
  const translatedContentE = document.getElementById('translate-content');
  window.addEventListener('message', (evt) => {
    if (!evt.data || !evt.data.data) {
      return;
    }
    switch (evt.data.type) {
      case `${TRANSLATE_IFRAME_ID}-sendTranslation`: {
        translatedText = evt.data.data.translatedText;
        translatedContentE.textContent = translatedText;
        translatedContentE.title = translatedText;
        const translationWidth = translatedContentE.offsetWidth;
        window.parent.postMessage({
          type: `${TRANSLATE_IFRAME_ID}-setWith`,
          data: translationWidth
        }, '*');
        break;
      }
      default:
        break;
    }
  }, false);
  window.parent.postMessage({
    type: `${TRANSLATE_IFRAME_ID}-getTranslation`
  }, '*');

  const addBtn = document.getElementById('add-vocab-button');
  addBtn.addEventListener('click', () => {
    window.parent.postMessage({
      type: `${TRANSLATE_IFRAME_ID}-add-btn-clicked`
    }, '*');
  });
});



