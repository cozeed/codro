import catalogOrganization from "../assets/img/structures/catalogOrganization.jpg";
import fishbone from "../assets/img/structures/fishbone.jpg";
import fishbone2 from "../assets/img/structures/fishbone2.jpg";
import logicalStructure from "../assets/img/structures/logicalStructure.jpg";
import logicalStructureLeft from "../assets/img/structures/logicalStructureLeft.jpg";
import mindMap from "../assets/img/structures/mindMap.jpg";
import organizationStructure from "../assets/img/structures/organizationStructure.jpg";
import rightFishbone from "../assets/img/structures/rightFishbone.jpg";
import rightFishbone2 from "../assets/img/structures/rightFishbone2.jpg";
import timeline from "../assets/img/structures/timeline.jpg";
import timeline2 from "../assets/img/structures/timeline2.jpg";
import verticalTimeline from "../assets/img/structures/verticalTimeline.jpg";
import verticalTimeline2 from "../assets/img/structures/verticalTimeline2.jpg";
import verticalTimeline3 from "../assets/img/structures/verticalTimeline3.jpg";

export const fontSizeList = [10, 12, 16, 18, 24, 32, 48];

export const lineStyleMap = {
  straight: `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="60" height="26"><path d="M18,14L30,14L30,5L42,5" fill="none" stroke="#000" stroke-width="2"></path><path d="M18,14L30,14L30,23L42,23" fill="none" stroke="#000" stroke-width="2"></path></svg>`,
  curve: `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="60" height="26"><path d="M18,14L30,14A12,-9 0 0 1 42,5" fill="none" stroke="#000" stroke-width="2"></path><path d="M18,14L30,14A12,9 0 0 0 42,23" fill="none" stroke="#000" stroke-width="2"></path></svg>`,
  direct: `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="60" height="26"><path d="M18,14L30,14L42,5" fill="none" stroke="#000" stroke-width="2"></path><path d="M18,14L30,14L42,23" fill="none" stroke="#000" stroke-width="2"></path></svg>`,
};

export const CONSTANTS = {
  LAYOUT: {
    LOGICAL_STRUCTURE: "logicalStructure",
    LOGICAL_STRUCTURE_LEFT: "logicalStructureLeft",
    MIND_MAP: "mindMap",
    ORGANIZATION_STRUCTURE: "organizationStructure",
    CATALOG_ORGANIZATION: "catalogOrganization",
    TIMELINE: "timeline",
    TIMELINE2: "timeline2",
    FISHBONE: "fishbone",
    FISHBONE2: "fishbone2",
    RIGHT_FISHBONE: "rightFishbone",
    RIGHT_FISHBONE2: "rightFishbone2",
    VERTICAL_TIMELINE: "verticalTimeline",
    VERTICAL_TIMELINE2: "verticalTimeline2",
    VERTICAL_TIMELINE3: "verticalTimeline3",
  },
};

export const layoutImgMap = {
  logicalStructure,
  logicalStructureLeft,
  mindMap,
  organizationStructure,
  catalogOrganization,
  timeline,
  timeline2,
  fishbone,
  fishbone2,
  rightFishbone,
  rightFishbone2,
  verticalTimeline,
  verticalTimeline2,
  verticalTimeline3,
};

export const rainbowLinesOptions = [
  {
    value: "close",
  },
  {
    value: "colors1",
    list: [
      "rgb(255, 213, 73)",
      "rgb(255, 136, 126)",
      "rgb(107, 225, 141)",
      "rgb(151, 171, 255)",
      "rgb(129, 220, 242)",
      "rgb(255, 163, 125)",
      "rgb(152, 132, 234)",
    ],
  },
  {
    value: "colors2",
    list: [
      "rgb(248, 93, 93)",
      "rgb(255, 151, 84)",
      "rgb(255, 214, 69)",
      "rgb(73, 205, 140)",
      "rgb(64, 192, 255)",
      "rgb(84, 110, 214)",
      "rgb(164, 93, 220)",
    ],
  },
  {
    value: "colors3",
    list: [
      "rgb(140, 240, 231)",
      "rgb(74, 210, 255)",
      "rgb(65, 168, 243)",
      "rgb(49, 128, 205)",
      "rgb(188, 226, 132)",
      "rgb(113, 215, 123)",
      "rgb(120, 191, 109)",
    ],
  },
  {
    value: "colors4",
    list: [
      "rgb(169, 98, 99)",
      "rgb(245, 125, 123)",
      "rgb(254, 183, 168)",
      "rgb(251, 218, 171)",
      "rgb(138, 163, 181)",
      "rgb(131, 127, 161)",
      "rgb(84, 83, 140)",
    ],
  },
  {
    value: "colors5",
    list: [
      "rgb(255, 229, 142)",
      "rgb(254, 158, 41)",
      "rgb(248, 119, 44)",
      "rgb(232, 82, 80)",
      "rgb(182, 66, 98)",
      "rgb(99, 54, 99)",
      "rgb(65, 40, 82)",
    ],
  },
  {
    value: "colors6",
    list: [
      "rgb(171, 227, 209)",
      "rgb(107, 201, 196)",
      "rgb(55, 170, 169)",
      "rgb(18, 135, 131)",
      "rgb(74, 139, 166)",
      "rgb(75, 105, 150)",
      "rgb(57, 75, 133)",
    ],
  },
];
