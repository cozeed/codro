import type { CoFile, CoFileTree, CoFolder } from "../types/file";
import { DOUBLE_LINK_REGEX } from "./constant";

const CODRO_LINK_PROTOCOL = "codro://";

export const getFileIdOrNameFromLink = (link: string) => {
  if (link.startsWith(CODRO_LINK_PROTOCOL)) {
    // file id
    return link.split(CODRO_LINK_PROTOCOL)?.[1];
  } else if (DOUBLE_LINK_REGEX.test(link)) {
    // file name
    return link?.match(DOUBLE_LINK_REGEX)?.[1];
  }
  return null;
};

export function getUniqueNameInSameTreeLevel(item: CoFile | CoFolder, fileTree: CoFileTree, parentId = "root") {
  const parent = fileTree[parentId];
  const itemNamesInSameTreeLevel = (parent?.children ?? [])
    .filter((id) => id !== item.id && fileTree[id]?.data?.type === item.type)
    .map((id) => fileTree[id]?.data?.name);

  const isRepeated = !!itemNamesInSameTreeLevel?.find((name) => name === item.name);
  let maxRepeatIndex = 0;
  const repeatIndexRegx = new RegExp(`^${item.name}\\(([0-9]+)\\)$`);
  if (isRepeated) {
    itemNamesInSameTreeLevel?.forEach((name) => {
      if (!name) return;
      const repeatIndex = name.match(repeatIndexRegx)?.[1];

      if (repeatIndex) {
        maxRepeatIndex = maxRepeatIndex > Number(repeatIndex) ? maxRepeatIndex : Number(repeatIndex);
      }
    });

    return `${item.name}(${maxRepeatIndex + 1})`;
  }
  return item.name;
}
