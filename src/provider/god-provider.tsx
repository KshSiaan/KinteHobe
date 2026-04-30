"use client";

import { useEffect, useState } from "react";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export default function GodProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDev = process.env.NODE_ENV === "development";

  const [queryClient, setQueryClient] = useState<QueryClient | null>(null);
  const [persister, setPersister] = useState<any>(null);

  useEffect(() => {
    // ✅ create ONLY on client
    const qc = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5,
          gcTime: 1000 * 60 * 30,
        },
      },
    });

    const p = createAsyncStoragePersister({
      storage: window.localStorage,
    });

    setQueryClient(qc);
    setPersister(p);
  }, []);

  // ⛔ prevent rendering until ready (important for PPR)
  if (!queryClient || !persister) return null;

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      {children}
      {isDev && <ReactQueryDevtools initialIsOpen={false} />}
    </PersistQueryClientProvider>
  );
}
