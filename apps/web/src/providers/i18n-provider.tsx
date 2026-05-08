import React, { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { I18nextProvider } from "react-i18next";
import { loadFontForLang } from "@/lib/utils";
import { langCodeAtom } from "@/store/jotai";

import i18n from "../i18n/config";

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [langCode] = useAtom(langCodeAtom);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (langCode) {
      loadFontForLang(langCode);
      i18n.changeLanguage(langCode);
    }
    console.log("✅ i18n ready for lang:", langCode);
    queueMicrotask(() => setReady(true));
  }, [langCode]);
  if (!ready) return null;
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};
