import "server-only";

import { drizzle } from "drizzle-orm/neon-serverless";

function getStorageDatabaseUrl() {
  const url = process.env.STORAGE_DB_URL;

  if (!url) {
    throw new Error("Missing STORAGE_DB_URL environment variable");
  }

  return url;
}

const storageDatabaseUrl = getStorageDatabaseUrl();

// Shared Drizzle client for storage-focused server usage.
export const storageDb = drizzle(storageDatabaseUrl);

export function createStorageDbClient() {
  return drizzle(storageDatabaseUrl);
}
