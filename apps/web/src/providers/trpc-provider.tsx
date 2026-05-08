import React from "react";
import { queryClient } from "@/clients/query-client";
import { trpcClient } from "@/clients/trpc-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { trpc } from "@workspace/api/client";

export const TrpcProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </trpc.Provider>
    </QueryClientProvider>
  );
};
