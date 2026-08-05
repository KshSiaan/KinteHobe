import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { followRelation } from "@/db/schema";
import { and, eq } from "drizzle-orm";

type Params = {
  params: Promise<{ id: string }>;
};

// PATCH /api/follow/[id]
// Accept or reject a follow request.
// Only the person being followed can do this.
export async function PATCH(
  request: Request,
  { params }: Params,
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return Response.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const { id } = await params;

  const { action } = (await request.json()) as {
    action: "accept" | "reject";
  };

  if (action !== "accept" && action !== "reject") {
    return Response.json(
      {
        ok: false,
        message: "action must be 'accept' or 'reject'",
      },
      { status: 400 },
    );
  }

  // Make sure this request belongs to the current user
  const existing = await db.query.followRelation.findFirst({
    where: and(
      eq(followRelation.id, id),
      eq(followRelation.followingId, session.user.id),
    ),
  });

  if (!existing) {
    return Response.json(
      { ok: false, message: "Request not found" },
      { status: 404 },
    );
  }

  if (existing.status !== "pending") {
    return Response.json(
      {
        ok: false,
        message: "Request already handled",
        data: existing,
      },
      { status: 409 },
    );
  }

  // Reject
  if (action === "reject") {
    const [updated] = await db
      .update(followRelation)
      .set({
        status: "rejected",
      })
      .where(eq(followRelation.id, id))
      .returning();

    return Response.json({
      ok: true,
      data: updated,
    });
  }

  // Accept the incoming request
  const [updated] = await db
    .update(followRelation)
    .set({
      status: "accepted",
    })
    .where(eq(followRelation.id, id))
    .returning();

  // The person who sent the request
  const followerId = existing.followerId;

  // The current user
  const followingId = existing.followingId;

  // Check if reverse relationship already exists
  const reverse = await db.query.followRelation.findFirst({
    where: and(
      eq(followRelation.followerId, followingId),
      eq(followRelation.followingId, followerId),
    ),
  });

  if (!reverse) {
    await db.insert(followRelation).values({
      id: crypto.randomUUID(),
      followerId: followingId,
      followingId: followerId,
      status: "accepted",
    });
  } else if (reverse.status !== "accepted") {
    await db
      .update(followRelation)
      .set({
        status: "accepted",
      })
      .where(eq(followRelation.id, reverse.id));
  }

  return Response.json({
    ok: true,
    data: updated,
  });
}

// DELETE /api/follow/[id]
// Unfollow — removes both directions.
export async function DELETE(
  request: Request,
  { params }: Params,
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return Response.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const { id } = await params;

  // Make sure the relationship belongs to the current user
  const existing = await db.query.followRelation.findFirst({
    where: and(
      eq(followRelation.id, id),
      eq(followRelation.followerId, session.user.id),
      eq(followRelation.status, "accepted"),
    ),
  });

  if (!existing) {
    return Response.json(
      { ok: false, message: "Relationship not found" },
      { status: 404 },
    );
  }

  // Remove my relationship
  await db
    .delete(followRelation)
    .where(eq(followRelation.id, existing.id));

  // Remove the reverse relationship
  await db
    .delete(followRelation)
    .where(
      and(
        eq(followRelation.followerId, existing.followingId),
        eq(followRelation.followingId, existing.followerId),
      ),
    );

  return Response.json({
    ok: true,
    message: "Unfollowed successfully",
  });
}
