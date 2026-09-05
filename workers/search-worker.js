import { searchHistory } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { parentPort } from "node:worker_threads";
import {
  desc,
  eq,
  inArray,
  isNull,
} from "drizzle-orm";

async function logToDatabase(data) {
  if (!data?.q || data?.type) {
    console.error("[Search Worker] Missing query");
    return;
  }

  try {
    let userId = null;

    // Get authenticated user if available
    if (data.headers) {
      const session = await auth.api.getSession({
        headers: new Headers(data.headers),
      });

      userId = session?.user?.id ?? null;
    }

    // --------------------------------------------------
    // 1. INSERT NEW SEARCH
    // --------------------------------------------------

    await db.insert(searchHistory).values({
      id: crypto.randomUUID(),
      query: data.q,
      searchType: data.type || "normal",
      authorId: userId,
    });

    //! --------------------------------------------------
    //! 2. FIND SEARCHES OLDER THAN THE LATEST "250" SEARCHES
    //! --------------------------------------------------

    const oldHistories = await db
      .select({
        id: searchHistory.id,
      })
      .from(searchHistory)
      .where(
        userId
          ? eq(searchHistory.authorId, userId)
          : isNull(searchHistory.authorId),
      )
      .orderBy(
        desc(searchHistory.createdAt),
        desc(searchHistory.id),
      )
      .offset(250);

    // --------------------------------------------------
    // 3. DELETE OLD SEARCHES
    // --------------------------------------------------

    if (oldHistories.length > 0) {
      await db
        .delete(searchHistory)
        .where(
          inArray(
            searchHistory.id,
            oldHistories.map((history) => history.id),
          ),
        );
    }
  } catch (error) {
    console.error(
      "[Search Worker] Error logging search history:",
      error,
    );
  }
}

if (!parentPort) {
  throw new Error(
    "This module must be run as a worker thread",
  );
}

parentPort.on("message", (data) => {
  void logToDatabase(data);
});
