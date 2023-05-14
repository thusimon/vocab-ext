export interface SettingsType {
  SOURCE_LANG: string;
  TARGET_LANG: string;
  ENABLE_API: boolean;
};

export interface StorageValueType {
  [key: string]: object | string
};
