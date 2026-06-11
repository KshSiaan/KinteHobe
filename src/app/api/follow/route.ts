import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { followRequest } from "@/db/schema";
import { and, eq } from "drizzle-orm";

// POST /api/follow — send follow request
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { targetUserId } = await request.json();
  if (!targetUserId) {
    return Response.json({ ok: false, message: "targetUserId required" }, { status: 400 });
  }
  if (targetUserId === session.user.id) {
    return Response.json({ ok: false, message: "Cannot follow yourself" }, { status: 400 });
  }

  const existing = await db.query.followRequest.findFirst({
    where: and(
      eq(followRequest.followerId, session.user.id),
      eq(followRequest.followingId, targetUserId),
    ),
  });

  if (existing) {
    return Response.json({ ok: false, message: "Request already exists", data: existing }, { status: 409 });
  }

  const [created] = await db
    .insert(followRequest)
    .values({
      id: crypto.randomUUID(),
      followerId: session.user.id,
      followingId: targetUserId,
      status: "pending",
    })
    .returning();

  return Response.json({ ok: true, data: created }, { status: 201 });
}

// GET /api/follow — outgoing requests sent by current user
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const outgoing = await db.query.followRequest.findMany({
    where: eq(followRequest.followerId, session.user.id),
  });

  return Response.json({ ok: true, data: outgoing });
}
