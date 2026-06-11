import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { followRequest } from "@/db/schema";
import { and, eq } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/follow/[id] — accept or reject (only the recipient can do this)
export async function PATCH(request: Request, { params }: Params) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { action } = (await request.json()) as { action: "accept" | "reject" };
  if (action !== "accept" && action !== "reject") {
    return Response.json({ ok: false, message: "action must be 'accept' or 'reject'" }, { status: 400 });
  }

  const existing = await db.query.followRequest.findFirst({
    where: and(eq(followRequest.id, id), eq(followRequest.followingId, session.user.id)),
  });

  if (!existing) {
    return Response.json({ ok: false, message: "Request not found" }, { status: 404 });
  }
  if (existing.status !== "pending") {
    return Response.json({ ok: false, message: "Request already handled" }, { status: 409 });
  }

  const [updated] = await db
    .update(followRequest)
    .set({ status: action === "accept" ? "accepted" : "rejected" })
    .where(eq(followRequest.id, id))
    .returning();

  // On accept: create the reverse record so both parties see each other
  if (action === "accept") {
    const reverse = await db.query.followRequest.findFirst({
      where: and(
        eq(followRequest.followerId, session.user.id),
        eq(followRequest.followingId, existing.followerId),
      ),
    });

    if (!reverse) {
      await db.insert(followRequest).values({
        id: crypto.randomUUID(),
        followerId: session.user.id,
        followingId: existing.followerId,
        status: "accepted",
      });
    } else if (reverse.status !== "accepted") {
      await db
        .update(followRequest)
        .set({ status: "accepted" })
        .where(eq(followRequest.id, reverse.id));
    }
  }

  return Response.json({ ok: true, data: updated });
}

// DELETE /api/follow/[id] — unfollow (removes both directions — mutual unfriend)
export async function DELETE(request: Request, { params }: Params) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await db.query.followRequest.findFirst({
    where: and(eq(followRequest.id, id), eq(followRequest.followerId, session.user.id)),
  });

  if (!existing) {
    return Response.json({ ok: false, message: "Request not found" }, { status: 404 });
  }

  // Delete both directions
  await db.delete(followRequest).where(eq(followRequest.id, id));
  await db.delete(followRequest).where(
    and(
      eq(followRequest.followerId, existing.followingId),
      eq(followRequest.followingId, existing.followerId),
    ),
  );

  return Response.json({ ok: true });
}
