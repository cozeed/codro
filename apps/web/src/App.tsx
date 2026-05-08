import { lazy, Suspense, useEffect } from "react";
import { TitleBar } from "@/pages/title-bar";
import { FileTreeDBProvider } from "@/providers/file-tree-db-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { useAuth } from "@/hooks/use-auth";
import { isTauriApp } from "@/lib/navigator";
import { autoUpdate } from "@/lib/updater";

// import { TailwindIndicator } from "./components/tailwind-indicator";
import { cn } from "./lib/utils";
import { MainLayoutSkeleton } from "./pages/main-layout/main-layout-skeleton";
import MainTabs from "./pages/main-tabs";

const MainLayout = lazy(() => import("./pages/main-layout"));

function App() {
  const { userId } = useAuth();

  useEffect(() => {
    console.log("isTauriApp=", isTauriApp());
    if (isTauriApp()) autoUpdate();
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <FileTreeDBProvider id={`file_tree_${userId}`}>
        <div
          className="border-border dark:border-background flex h-screen flex-col overflow-clip border-2"
          // Prevent file tree dragover events from bubbling to document,
          // otherwise BlockNote's DropCursorView throws an error.
          onDragOver={(e) => e.stopPropagation()}
        >
          <TitleBar />
          <div
            className={cn(
              "bg-background flex-1 overflow-auto border-t",
              "scrollbar scrollbar-track-transparent scrollbar-thumb-accent scrollbar-thumb-rounded-md",
            )}
          >
            <Suspense fallback={<MainLayoutSkeleton />}>
              <MainLayout>
                <MainTabs />
              </MainLayout>
            </Suspense>
          </div>
        </div>
        {/* <TailwindIndicator /> */}
      </FileTreeDBProvider>
    </ThemeProvider>
  );
}

export default App;
