import { StorageValueType, VersionNumberType } from "../types";

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

export const parseIntWithDefault = (intStr: string, def: number = 0): number => {
  const parsedInt = parseInt(intStr);
  return Number.isNaN(parsedInt) ? def : parsedInt;
};

export const parseVersionString = (versionStr: string): VersionNumberType => {
  const versionParts = versionStr.split('.');
  return [
    parseIntWithDefault(versionParts[0]),
    parseIntWithDefault(versionParts[1]),
    parseIntWithDefault(versionParts[2])
  ];
};

export const compareVersion = (v1Str: string, v2Str: string, digits: number = 2): number => {
  const v1 = parseVersionString(v1Str);
  const v2 = parseVersionString(v2Str);
  for(let i = 0; i < v1.length && i < digits; i++) {
    if (v1[i] === v2[i]) {
      continue;
    }
    return v1[i] < v2[i] ? -1 : 1; 
  }
  return 0;
};

export const setBadge = (text: string, foreground: string, background: string) => {
  chrome.action.setBadgeText({ text: text });
  chrome.action.setBadgeTextColor({color: foreground});
  chrome.action.setBadgeBackgroundColor({color: background});
};
