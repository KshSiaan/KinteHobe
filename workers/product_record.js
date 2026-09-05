import { productVisit } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { parentPort } from "node:worker_threads";
import { desc, eq, inArray, isNull } from "drizzle-orm";

async function logToDatabase(data) {
  if (!data?.productId) {
    console.error("[Product Visit Worker] Missing product ID");
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

    await db.insert(productVisit).values({
      id: crypto.randomUUID(),
      visitorId: userId,
      productId: data.productId,
    });

    //! --------------------------------------------------
    //! 2. FIND SEARCHES OLDER THAN THE LATEST "250" SEARCHES
    //! --------------------------------------------------

    const oldHistories = await db
      .select({
        id: productVisit.id,
      })
      .from(productVisit)
      .where(
        userId
          ? eq(productVisit.visitorId, userId)
          : isNull(productVisit.visitorId),
      )
      .orderBy(desc(productVisit.createdAt), desc(productVisit.id))
      .offset(250);

    // --------------------------------------------------
    // 3. DELETE OLD SEARCHES
    // --------------------------------------------------

    if (oldHistories.length > 0) {
      await db.delete(productVisit).where(
        inArray(
          productVisit.id,
          oldHistories.map((history) => history.id),
        ),
      );
    }
  } catch (error) {
    console.error("[Product Visit Worker] Error logging product visit:", error);
  }
}

if (!parentPort) {
  throw new Error("This module must be run as a worker thread");
}

parentPort.on("message", (data) => {
  void logToDatabase(data);
});
