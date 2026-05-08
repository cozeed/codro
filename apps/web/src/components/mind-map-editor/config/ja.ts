import { CONSTANTS } from "./constant";

export const fontFamilyList = [
  {
    name: "游ゴシック",
    value: "Yu Gothic, YuGothic, Hiragino Sans, Meiryo, sans-serif",
  },
  {
    name: "游明朝",
    value: "Yu Mincho, YuMincho, Hiragino Mincho, serif",
  },
  {
    name: "メイリオ",
    value: "Meiryo, Hiragino Sans, sans-serif",
  },
  {
    name: "MS ゴシック",
    value: "MS Gothic, Osaka-Mono, monospace",
  },
  {
    name: "MS 明朝",
    value: "MS Mincho, serif",
  },
  {
    name: "ヒラギノ角ゴ",
    value: "Hiragino Sans, Yu Gothic, Meiryo, sans-serif",
  },
  {
    name: "ヒラギノ明朝",
    value: "Hiragino Mincho, Yu Mincho, serif",
  },
  {
    name: "Noto Sans JP",
    value: "'Noto Sans JP', sans-serif",
  },
  {
    name: "Arial",
    value: "Arial, Helvetica, sans-serif",
  },
  {
    name: "Times New Roman",
    value: "Times New Roman, serif",
  },
  {
    name: "Sans-Serif",
    value: "sans-serif",
  },
  {
    name: "Serif",
    value: "serif",
  },
];

export const lineStyleList = [
  {
    name: "直線",
    value: "straight",
  },
  {
    name: "曲線",
    value: "curve",
  },
  {
    name: "直接接続",
    value: "direct",
  },
];

export const alignList = [
  {
    name: "左揃え",
    value: "left",
  },
  {
    name: "中央揃え",
    value: "center",
  },
  {
    name: "右揃え",
    value: "right",
  },
];

export const layoutList = [
  {
    name: "ロジック構造図",
    value: CONSTANTS.LAYOUT.LOGICAL_STRUCTURE,
  },
  {
    name: "左向きロジック構造図",
    value: CONSTANTS.LAYOUT.LOGICAL_STRUCTURE_LEFT,
  },
  {
    name: "マインドマップ",
    value: CONSTANTS.LAYOUT.MIND_MAP,
  },
  {
    name: "組織図",
    value: CONSTANTS.LAYOUT.ORGANIZATION_STRUCTURE,
  },
  {
    name: "カタログ構造図",
    value: CONSTANTS.LAYOUT.CATALOG_ORGANIZATION,
  },
  {
    name: "タイムライン",
    value: CONSTANTS.LAYOUT.TIMELINE,
  },
  {
    name: "タイムライン 2",
    value: CONSTANTS.LAYOUT.TIMELINE2,
  },
  {
    name: "縦型タイムライン",
    value: CONSTANTS.LAYOUT.VERTICAL_TIMELINE,
  },
  {
    name: "縦型タイムライン 2",
    value: CONSTANTS.LAYOUT.VERTICAL_TIMELINE2,
  },
  {
    name: "縦型タイムライン 3",
    value: CONSTANTS.LAYOUT.VERTICAL_TIMELINE3,
  },
  {
    name: "フィッシュボーン図",
    value: CONSTANTS.LAYOUT.FISHBONE,
  },
  {
    name: "フィッシュボーン図 2",
    value: CONSTANTS.LAYOUT.FISHBONE2,
  },
];
