import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { followRelation, user } from "@/db/schema";
import { and, eq, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

// GET /api/follow/friends
// Returns all accepted relationships involving the current user.
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

  const myId = session.user.id;

  const friendUser = alias(user, "friend_user");

  const rows = await db
    .select({
      requestId: followRelation.id,

      person: {
        id: friendUser.id,
        name: friendUser.name,
        email: friendUser.email,
        image: friendUser.image,
      },
    })
    .from(followRelation)
    .innerJoin(
      friendUser,
      or(
        and(
          eq(followRelation.followerId, myId),
          eq(followRelation.followingId, friendUser.id),
        ),
        and(
          eq(followRelation.followingId, myId),
          eq(followRelation.followerId, friendUser.id),
        ),
      ),
    )
    .where(
      and(
        eq(followRelation.status, "accepted"),
        or(
          eq(followRelation.followerId, myId),
          eq(followRelation.followingId, myId),
        ),
      ),
    );

  return Response.json({
    ok: true,
    data: rows,
  });
}
