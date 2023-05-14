import { StorageValueType } from "../types";

export const storageGetP = (key, defaultValue): Promise<StorageValueType> => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (value) => {
      let storageValue = {};
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

export const storageSetP = (key, value): Promise<StorageValueType> => {
  return new Promise((resolve, reject) => {
    const data = {[key]: value}
    chrome.storage.local.set(data, () => {
      resolve(data);
    });
  });
};

export const removeAllChildNodes = (parent) => {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
};

export const getI18NMessage = (localStrings, lang, key) => {
  const engKeys = localStrings.en;
  const langKeys = localStrings[lang] ? localStrings[lang] : engKeys
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

export const setDomStyles = (elem, prop, value) => {
  elem.style.setProperty(prop, value, 'important');
};

export const sendMessage = async (type, data, callback) => {
  if (!chrome || !chrome.runtime || !chrome.runtime.sendMessage) {
    return;
  }
  try {
    const resp = await chrome.runtime.sendMessage({ type, data });
    if (callback) {
      return callback(resp);
    }
  } catch(err) {
    // do not log in content script
    // TODO: log in service-worker
  }
};
