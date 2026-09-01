import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { followRelation } from "@/db/schema";
import { and, eq } from "drizzle-orm";

// POST /api/follow — send follow request
export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return Response.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const { targetUserId } = await request.json();

  if (!targetUserId) {
    return Response.json(
      { ok: false, message: "targetUserId required" },
      { status: 400 },
    );
  }

  if (targetUserId === session.user.id) {
    return Response.json(
      { ok: false, message: "Cannot follow yourself" },
      { status: 400 },
    );
  }

  const existing = await db.query.followRelation.findFirst({
    where: and(
      eq(followRelation.followerId, session.user.id),
      eq(followRelation.followingId, targetUserId),
    ),
  });

  // No previous relationship → create a new request
  if (!existing) {
    const [created] = await db
      .insert(followRelation)
      .values({
        id: crypto.randomUUID(),
        followerId: session.user.id,
        followingId: targetUserId,
        status: "pending",
      })
      .returning();

    return Response.json({ ok: true, data: created }, { status: 201 });
  }

  // Previously rejected → allow the user to request again
  if (existing.status === "rejected") {
    const [updated] = await db
      .update(followRelation)
      .set({
        status: "pending",
      })
      .where(eq(followRelation.id, existing.id))
      .returning();

    return Response.json({ ok: true, data: updated }, { status: 200 });
  }

  // Already waiting for approval
  if (existing.status === "pending") {
    return Response.json(
      {
        ok: false,
        message: "Follow request already pending",
        data: existing,
      },
      { status: 409 },
    );
  }

  // Already accepted
  if (existing.status === "accepted") {
    return Response.json(
      {
        ok: false,
        message: "Already following this user",
        data: existing,
      },
      { status: 409 },
    );
  }

  return Response.json(
    { ok: false, message: "Unable to send follow request" },
    { status: 400 },
  );
}

// GET /api/follow — outgoing relationships for current user
export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return Response.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const outgoing = await db.query.followRelation.findMany({
    where: eq(followRelation.followerId, session.user.id),
  });

  return Response.json({
    ok: true,
    data: outgoing,
  });
}
