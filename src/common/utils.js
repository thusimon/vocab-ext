import { I18Ns } from "./constants";

export const storageGetP = (key, defaultValue) => {
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

export const storageSetP = (key, value) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({[key]: value}, () => {
      resolve();
    });
  });
};

export const removeAllChildNodes = (parent) => {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
};

export const getI18NMessage = (lang, key) => {
  const engKeys = I18Ns.en;
  const langKeys = I18Ns[lang] ? I18Ns[lang] : engKeys
  if (langKeys[key]) {
    return langKeys[key];
  }
  if (engKeys[key]) {
    return engKeys[key];
  }
  return `i18n_error[${lang}-${key}]`;
};

export const getTranslateUri = (base, params) => {
  return `${base}?${new URLSearchParams(params)}`;
};

export const formatString = (message, ...params) => {
  params.forEach(param => {
    message = message.replace('{}', param);
  });
  return message;
};

export const debounce = (func, timeout = 200) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
};
