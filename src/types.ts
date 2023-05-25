export interface SettingsType {
  SOURCE_LANG: string;
  TARGET_LANG: string;
  ENABLE_API: boolean;
};

export interface UsageType {
  VERSION_SEEN: string;
};

export type VersionNumberType = [number, number, number];

export interface StorageValueType {
  [key: string]: object | string
};
