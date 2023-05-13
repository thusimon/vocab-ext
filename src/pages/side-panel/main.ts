console.log('side-panel init');

chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  const {type, data} = msg;
  if (!type) {
    return;
  }
  switch (type) {
    case 'SELECTED_TEXT': {
      console.log(10, data);
      // if (data.selectionText && data.selectionText.length > 5) {
      //   (chrome as any).sidePanel.setOptions({
      //     tabId: sender.tab.id,
      //     path: './pages/side-panel/index.html',
      //     enabled: true
      //   });
      // } else {
      //   (chrome as any).sidePanel.setOptions({
      //     tabId: sender.tab.id,
      //     enabled: false
      //   });
      // }
      // console.log('enabled pannel');
      // sendResponse('UPDATE_SIDE_PANEL');
      break;
    }
  }
});
