interface StorageValueType {
  [key: string]: object | string
};

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