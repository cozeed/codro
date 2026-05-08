"use client";

import type { FC } from "react";
import { AuiProvider, Suggestions, useAui } from "@assistant-ui/react";
import { useTranslation } from "react-i18next";
import { Thread } from "@/components/assistant-ui/thread";

export const ThreadWithSuggestions: FC = () => {
  const { i18n } = useTranslation();

  return <ThreadWithSuggestionsInner key={i18n.language} />;
};

const ThreadWithSuggestionsInner: FC = () => {
  const { t } = useTranslation();

  const SUGGESTION_KEYS = [
    "suggestions1",
    "suggestions2",
    "suggestions3",
    "suggestions4",
    "suggestions5",
    "suggestions6",
    "suggestions7",
    "suggestions8",
    "suggestions9",
    "suggestions10",
    "suggestions11",
    "suggestions12",
    "suggestions13",
  ];

  const suggestions = Suggestions(
    SUGGESTION_KEYS.map((key) => {
      const text = t(`operation.${key}`);
      return {
        title: text,
        label: "",
        prompt: text,
      };
    }),
  );

  const aui = useAui({
    suggestions,
  });

  return (
    <AuiProvider value={aui}>
      <Thread />
    </AuiProvider>
  );
};
