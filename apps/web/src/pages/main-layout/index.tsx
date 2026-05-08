import type { ReactNode } from "react";
import { useCallback } from "react";
import { useAtom } from "jotai";
import { PanelLeft } from "lucide-react";
import { usePanelRef } from "react-resizable-panels";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@workspace/ui/components/resizable";
import { currentSidebarAtom, siderbarCollapsedAtom } from "@/store/jotai";

import { ChatSidebar } from "../chat-sidebar";
import { LeftToolbar } from "../left-toolbar";
import { MainSidebar } from "../main-sidebar";

type Props = {
  children: ReactNode;
};

const defaultLayout = ["20%", "80%"];

const MainLayout = ({ children }: Props) => {
  const panelRef = usePanelRef();
  const [_, setCollapsed] = useAtom(siderbarCollapsedAtom);
  const [currentSidebar] = useAtom(currentSidebarAtom);

  const switchCollapse = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const collapsedTemp = panel.isCollapsed();
    if (collapsedTemp) {
      panel.expand();
    } else {
      panel.collapse();
    }
    setCollapsed(!collapsedTemp);
  }, [setCollapsed, panelRef]);

  return (
    <ResizablePanelGroup orientation="horizontal" className="h-full w-full">
      {/* ================= Sidebar ================= */}
      <ResizablePanel
        panelRef={panelRef}
        defaultSize={defaultLayout[0]}
        minSize="15%"
        maxSize="50%"
        // collapsedSize={38}
        collapsible
        className="bg-tree-background transition-width relative flex min-w-10 flex-row duration-50 ease-in-out"
      >
        <LeftToolbar />

        <MainSidebar
          tabIndex={currentSidebar === "main" ? 0 : -1}
          className={`absolute inset-0 left-10 w-[calc(100%-2.5rem)] overflow-hidden transition-opacity duration-300 ${
            currentSidebar === "main" ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />

        <ChatSidebar
          tabIndex={currentSidebar === "chat" ? 0 : -1}
          className={`absolute inset-0 left-10 w-[calc(100%-2.5rem)] overflow-hidden transition-opacity duration-300 ${
            currentSidebar === "chat" ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />
      </ResizablePanel>

      {/* ================= Resize Handle ================= */}
      <ResizableHandle
        withHandle={false}
        className="bg-tree-background relative z-50 w-1.5 overflow-hidden border-r transition-colors duration-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-hidden data-[separator=active]:bg-blue-500 data-[separator=hover]:bg-blue-500"
      />

      {/* ================= Main ================= */}
      <ResizablePanel defaultSize={defaultLayout[1]} className="relative">
        <PanelLeft
          onClick={switchCollapse}
          className="absolute z-50 mt-1.5 ml-1 h-5 w-5 cursor-pointer text-gray-500 transition-colors duration-200 hover:brightness-50 dark:text-gray-400 dark:hover:brightness-125"
        />

        {children}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
export default MainLayout;
