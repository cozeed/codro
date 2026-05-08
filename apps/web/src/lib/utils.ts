import { clsx, type ClassValue } from "clsx";
import { customAlphabet } from "nanoid";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (input: string | number): string => {
  const date = new Date(input);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};
// Asynchronously loads the corresponding font based on the provided language code and sets the font variable for the root element.
export const loadFontForLang = async (lang: string) => {
  const other = `ui-sans-serif, sans-serif, system-ui, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`;
  const fontMap: Record<string, string> = {
    en: `'Roboto Variable', ${other}`,
    "zh-CN": `'Roboto Variable', 'Noto Sans SC Variable', ${other}`,
    "zh-TW": `'Roboto Variable', 'Noto Sans TC Variable', ${other}`,
    ja: `'Roboto Variable', 'Noto Sans JP Variable', ${other}`,
  };
  await import("@fontsource-variable/roboto");

  if (lang === "zh-CN") {
    await import("@fontsource-variable/noto-sans-sc");
  } else if (lang === "zh-TW") {
    await import("@fontsource-variable/noto-sans-tc");
  } else if (lang === "ja") {
    await import("@fontsource-variable/noto-sans-jp");
  }

  const font = fontMap[lang] || fontMap["en"]!;

  document.documentElement.style.setProperty("--font-sans", font);
};

/**
 * Computes the position of a context menu relative to a target element,
 * ensuring it doesn't overflow the viewport.
 */

export function computeMenuPosition(x: number, y: number, menuWidth: number, menuHeight: number, container: Element) {
  const rect = container.getBoundingClientRect();

  let adjustedX = x;
  let adjustedY = y;

  const maxX = rect.left + rect.width;
  const maxY = rect.top + rect.height;

  if (x + menuWidth > maxX) {
    adjustedX = Math.max(rect.left, x - menuWidth);
  }

  if (y + menuHeight > maxY) {
    adjustedY = Math.max(rect.top, y - menuHeight);
  }

  return { x: adjustedX, y: adjustedY };
}
export async function sha256(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

export const generateId = (size = 10) => {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  const nanoid = customAlphabet(alphabet, size);
  return nanoid();
};
