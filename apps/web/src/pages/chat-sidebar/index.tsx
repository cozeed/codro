import { env } from "@/env";
import { AssistantCloud, AssistantRuntimeProvider } from "@assistant-ui/react";
import { AssistantChatTransport, useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { useAtom } from "jotai";
import { Bot, CircleArrowLeft, FileClock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@workspace/ui/components/button";
import { currentModelAtom, currentSidebarAtom, showThreadListAtom } from "@/store/jotai";
import { ThreadList } from "@/components/assistant-ui/thread-list";
import { ThreadWithSuggestions } from "@/components/assistant-ui/thread-with-suggestions";
import { Tooltip } from "@/components/tooltip";

import { ModelSelector } from "../settings/provider/model-selector";

interface Props {
  tabIndex?: number;
  className?: string;
}

const cloud = new AssistantCloud({
  baseUrl: env.PUBLIC_ASSISTANT_BASE_URL!,
  anonymous: true,
});

export const ChatSidebar = ({ tabIndex, className }: Props) => {
  const { t } = useTranslation();
  const [currentModel, setCurrentModel] = useAtom(currentModelAtom);
  const [showThreadList, setShowThreadList] = useAtom(showThreadListAtom);
  const [, setCurrentSidebar] = useAtom(currentSidebarAtom);

  const runtime = useChatRuntime({
    cloud,
    id: currentModel,
    transport: new AssistantChatTransport({
      api: `${env.PUBLIC_SERVER_URL}${env.PUBLIC_SERVER_API_PATH}/chat`,
      credentials: "include",
      body: {
        model: currentModel,
        system: t("operation.systemPromptLanguage"),
      },
    }),
  });

  return (
    <div tabIndex={tabIndex} className={className}>
      <AssistantRuntimeProvider runtime={runtime}>
        <div className="flex h-full w-full flex-col p-1">
          <div className="mb-4 flex items-center gap-0.5">
            {/* model selector */}
            <div className="flex-1">
              <ModelSelector currentModel={currentModel} setCurrentModel={setCurrentModel} />
            </div>
            {/* switch to history */}
            <Tooltip
              content={t(showThreadList ? "operation.backToChat" : "operation.viewHistory")}
              delay={0}
              side="bottom"
              sideOffset={-4}
              className=""
            >
              <Button variant="ghost" className="size-7" onClick={() => setShowThreadList((prev) => !prev)}>
                {showThreadList ? <Bot className="size-5" /> : <FileClock className="size-5" />}
              </Button>
            </Tooltip>
            {/* switch to main sidebar */}
            <Tooltip content={t("operation.backToMainPage")} delay={0} side="bottom" sideOffset={-4} className="">
              <Button variant="ghost" className="size-7" onClick={() => setCurrentSidebar("main")}>
                <CircleArrowLeft className="size-5" />
              </Button>
            </Tooltip>
          </div>

          {/* content area */}
          <div className="flex-1 overflow-auto">{showThreadList ? <ThreadList /> : <ThreadWithSuggestions />}</div>
        </div>
      </AssistantRuntimeProvider>
    </div>
  );
};
