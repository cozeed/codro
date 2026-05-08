import { Suspense } from "react";
import { I18nProvider } from "@/providers/i18n-provider";
import { PGliteProvider } from "@/providers/pglite-provider";
import { TrpcProvider } from "@/providers/trpc-provider";
import ReactDOM from "react-dom/client";
import { Toaster } from "@workspace/ui/components/sonner";
import { TooltipProvider } from "@workspace/ui/components/tooltip";

import App from "./App";

import "./utils/api";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  // <React.StrictMode>
  <Suspense>
    <TooltipProvider>
      <Toaster />
      <I18nProvider>
        <PGliteProvider>
          <TrpcProvider>
            <App />
          </TrpcProvider>
        </PGliteProvider>
      </I18nProvider>
    </TooltipProvider>
  </Suspense>,
  // </React.StrictMode>
);
