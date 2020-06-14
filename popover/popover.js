const viewVocabBtn = document.getElementById('view-vocab');

viewVocabBtn.addEventListener('click', () => {
  const url = chrome.runtime.getURL('/pages/view-vocabulary/index.html');
  chrome.tabs.create({url});
  window.close();
})