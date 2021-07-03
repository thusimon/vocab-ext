let originalText
  , translatedText

const processDictResult = (dictContainerE, dictE, dicts) => {
  removeAllChildNodes(dictE);
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

const processSynsets = (synsetsContainerE, synsetsE, synsets) => {
  if (synsets && synsets.length > 0) {
    synsetsContainerE.classList.remove('hide');
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
  }
}

const processExamples = (exampleContainerE, examplesE, examples) => {
  removeAllChildNodes(examplesE);
  if (examples && examples.length > 0) {
    exampleContainerE.classList.remove('hide');
    // take only the first two
    const lessExamples = examples.slice(0, 2);
    lessExamples.forEach((example, idx) => {
      const exampleEntry = document.createElement('div');
      exampleEntry.classList.add('example-entry');
      const exampleText = example.text || '';
      exampleEntry.innerHTML = `${idx+1}. ${exampleText}`;
      examplesE.appendChild(exampleEntry);
    });
  }
}

window.addEventListener('DOMContentLoaded', (event) => {
  const translatedContainerE = document.getElementById('translate-container');
  const sentenceE = document.getElementById('sentence');
  const dictCE = document.getElementById('dict-container');
  const dictE = document.getElementById('dict');
  const synsetsCE = document.getElementById('synsets-container');
  const synsetsE = document.getElementById('synsets');
  const exampleCE = document.getElementById('examples-container');
  const examplesE = document.getElementById('examples');
  const addBtn = document.getElementById('add-vocab-button');
  const readBtn = document.getElementById('read-vocab-button');
  const closeBtn = document.getElementById('close-btn');
  window.addEventListener('message', (evt) => {
    if (!evt.data || !evt.data.data) {
      return;
    }
    switch (evt.data.type) {
      case FRAME_EVENT_TYPE.SEND_TRANSLATION: {
        const data = evt.data.data;
        if (data.err) {
          // should hide the buttons and only show the error
          translatedContainerE.textContent = `Error: ${data.err}`;
          translatedContainerE.title = 'Error';
          document.body.classList.add('error');
          addBtn.classList.add('hide');
          readBtn.classList.add('hide');
        } else {
          translatedText = data.translatedText;
          originalText = data.originalText;
          sentenceE.textContent = translatedText;
          processDictResult(dictCE, dictE, data.dictResult);
          //processSynsets(synsetsCE, synsetsE, data.synsets);
          processExamples(exampleCE, examplesE, data.exampleRes);
        }
        const containerWidth = translatedContainerE.offsetWidth;
        const containerHeight = translatedContainerE.offsetHeight;
        window.parent.postMessage({
          type: FRAME_EVENT_TYPE.SET_TRANSLATION_SIZE,
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
  });

  closeBtn.addEventListener('click', () => {
    window.parent.postMessage({
      type: FRAME_EVENT_TYPE.CLOSE_TRANSLATE_MODAL
    }, '*');
  });
});



