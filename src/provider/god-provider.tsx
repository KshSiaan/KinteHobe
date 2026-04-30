"use client";

import { QueryClient } from "@tanstack/react-query";

import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useState } from "react";

export default function GodProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDev = process.env.NODE_ENV === "development";
  const [isMounted, setIsMounted] = useState(false);

  // ✅ stable QueryClient (important)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 min (tune this later)
            gcTime: 1000 * 60 * 30, // keep cache longer
          },
        },
      }),
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return children;
  }

  // ✅ localStorage persister (web)
  const persister = createAsyncStoragePersister({
    storage: window.localStorage,
  });

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
      }}
    >
      {children}

      {isDev && <ReactQueryDevtools initialIsOpen={false} />}
    </PersistQueryClientProvider>
  );
}
