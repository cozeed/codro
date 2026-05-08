import { useCallback, useEffect } from "react";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { loadFontForLang } from "@/lib/utils";
import { langCodeAtom } from "@/store/jotai";

const langCodeList = [
  {
    key: "en",
    label: "English",
  },
  {
    key: "zh-CN",
    label: "简体中文",
  },
  {
    key: "zh-TW",
    label: "繁體中文",
  },
  {
    key: "ja",
    label: "日本語",
  },
];

export const LanguageSwitcher = () => {
  const [langCode, setLangCode] = useAtom(langCodeAtom);
  const { i18n } = useTranslation();

  useEffect(() => {
    loadFontForLang(langCode);
    i18n.changeLanguage(langCode);
  }, [langCode, i18n]);

  const onChange = useCallback(
    (code: string) => {
      setLangCode(code);
    },
    [setLangCode],
  );

  return (
    <Select value={langCode} onValueChange={onChange}>
      <SelectTrigger className="text-muted-foreground w-full text-sm whitespace-nowrap focus:ring-0 focus:ring-offset-0">
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent>
        {langCodeList.map((item) => (
          <SelectItem key={item.key} value={item.key}>
            <span className="text-sm">{item.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
