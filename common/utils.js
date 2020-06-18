const storageGetP = (key, defaultValue) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (value) => {
      if (!value || !value[key]) {
        resolve(defaultValue);
      } else {
        resolve(value[key]);
      }
    });
  });
}

const storageSetP = (key, value) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({[key]: value}, () => {
      resolve();
    });
  });
}