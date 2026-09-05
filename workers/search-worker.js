import { searchHistory } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { parentPort } from "node:worker_threads";

async function logToDatabase(data) {
  if (!data.q) {
    console.error("Missing required data for logging search history");
    return;
  }

  let userId = null;
  if (data.headers) {
    const session = await auth.api.getSession({
      headers: data.headers,
    });
    userId = session?.user?.id || null;
  }
  try {
    const res = await db.insert(searchHistory).values({
      id: crypto.randomUUID(),
      query: data.q,
      authorId: userId,
    });

    if (!res) {
      console.error("Failed to log search history to the database");
    }
  } catch (error) {
    console.error("Error logging search history:", error);
  }
}

if (!parentPort) {
  throw new Error("This module must be run as a worker thread");
}

parentPort.on(
  "message",
  async (data) => {
    await logToDatabase(data);
  },
);
