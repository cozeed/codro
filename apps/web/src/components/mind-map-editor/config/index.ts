import {
  alignList as alignListEn,
  fontFamilyList as fontFamilyListEn,
  layoutList as layoutListEn,
  lineStyleList as lineStyleListEn,
} from "./en";
import {
  alignList as alignListJa,
  fontFamilyList as fontFamilyListJa,
  layoutList as layoutListJa,
  lineStyleList as lineStyleListJa,
} from "./ja";
import {
  alignList as alignListZh,
  fontFamilyList as fontFamilyListZh,
  layoutList as layoutListZh,
  lineStyleList as lineStyleListZh,
} from "./zh-cn";
import {
  alignList as alignListZhtw,
  fontFamilyList as fontFamilyListZhtw,
  layoutList as layoutListZhtw,
  lineStyleList as lineStyleListZhtw,
} from "./zh-tw";

const fontFamilyList = {
  en: fontFamilyListEn,
  "zh-CN": fontFamilyListZh,
  "zh-TW": fontFamilyListZhtw,
  ja: fontFamilyListJa,
};

const lineStyleList = {
  en: lineStyleListEn,
  "zh-CN": lineStyleListZh,
  "zh-TW": lineStyleListZhtw,
  ja: lineStyleListJa,
};

const alignList = {
  en: alignListEn,
  "zh-CN": alignListZh,
  "zh-TW": alignListZhtw,
  ja: alignListJa,
};

const layoutList = {
  en: layoutListEn,
  "zh-CN": layoutListZh,
  "zh-TW": layoutListZhtw,
  ja: layoutListJa,
};

export { fontFamilyList, lineStyleList, alignList, layoutList };
