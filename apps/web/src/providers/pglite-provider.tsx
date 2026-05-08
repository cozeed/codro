import React from "react";
import { DBProvider } from "@workspace/pglite";
import { useAuth } from "@/hooks/use-auth";

export const PGliteProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return <DBProvider userId={user?.id ?? null}>{children}</DBProvider>;
};
