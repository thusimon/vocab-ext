const storageGetP = (key, defaultValue) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (value) => {
      let storageValue;
      if (!value || !value[key]) {
        storageValue = {};
      } else {
        storageValue = value[key];
      }
      storageValue = Object.assign({}, defaultValue, storageValue);
      resolve(storageValue);
    });
  });
};

const storageSetP = (key, value) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({[key]: value}, () => {
      resolve();
    });
  });
};

const removeAllChildNodes = (parent) => {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
};

const getTranslateUri = (base, params) => {
  return `${base}?${new URLSearchParams(params)}`;
};

const debounce = (func, timeout = 200) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
};
