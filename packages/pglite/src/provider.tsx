"use client";

import { createContext, useEffect, useState } from "react";
import { PGliteProvider } from "@electric-sql/pglite-react";

import type { PGliteClient, PGliteDb } from "./index";
import { initializePGlite } from "./index";
import { startSync } from "./sync";

interface DBContextValue {
  client: PGliteClient | null;
  db: PGliteDb | null;
  status: DBStatus;
  setStatus: (status: DBStatus) => void;
  error: Error | null;
}

export enum DBStatus {
  Initializing = "initializing",
  Initialized = "initialized",
  PendingSync = "pending-sync",
  Syncing = "syncing",
  Ready = "ready",
  Error = "error",
}

export const DBContext = createContext<DBContextValue>({
  client: null,
  db: null,
  status: DBStatus.Initializing,
  setStatus: () => {},
  error: null,
});

interface DBProviderProps {
  children: React.ReactNode;
  userId: string | null;
}

export function DBProvider({ userId, children }: DBProviderProps) {
  const [client, setClient] = useState<PGliteClient | null>(null);
  const [db, setDb] = useState<PGliteDb | null>(null);
  const [status, setStatus] = useState(DBStatus.Initializing);
  const [error, setError] = useState<Error | null>(null);

  // initialize db on mount
  useEffect(() => {
    let cancelled = false;
    initializePGlite()
      .then(({ client: c, db: d }) => {
        if (cancelled) return;
        setClient(c);
        setDb(d);
        setStatus(DBStatus.Initialized);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("PGlite init failed:", err);
        setError(err as Error);
        setStatus(DBStatus.Error);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // set status to pending sync when userId changes
  useEffect(() => {
    if (!client || !db) return;
    if (!userId || userId === "anonymous") {
      setStatus(DBStatus.Ready);
      return;
    }
    setStatus(DBStatus.PendingSync);
  }, [userId, client, db]);

  // start sync
  useEffect(() => {
    if (status !== DBStatus.PendingSync) return;
    if (!userId || !client) return;

    (async () => {
      try {
        setStatus(DBStatus.Syncing);
        await startSync(client, userId);
        setStatus(DBStatus.Ready);
      } catch (err) {
        console.error("Sync error:", err);
        setError(err as Error);
        setStatus(DBStatus.Error);
      }
    })();
  }, [status, userId, client]);

  if (!client) return null;

  const contextValue: DBContextValue = {
    client,
    db,
    status,
    setStatus,
    error,
  };

  return (
    <DBContext.Provider value={contextValue}>
      <PGliteProvider db={client}>{children}</PGliteProvider>
    </DBContext.Provider>
  );
}
