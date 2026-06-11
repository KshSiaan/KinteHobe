import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { followRequest, user } from "@/db/schema";
import { and, eq, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

// GET /api/follow/friends — all accepted follow relationships involving current user
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const myId = session.user.id;

  // People I follow (I am follower, accepted)
  const followingUser = alias(user, "following_user");

  const rows = await db
    .select({
      requestId: followRequest.id,
      followerId: followRequest.followerId,
      followingId: followRequest.followingId,
      person: {
        id: followingUser.id,
        name: followingUser.name,
        email: followingUser.email,
        image: followingUser.image,
      },
    })
    .from(followRequest)
    .innerJoin(followingUser, eq(followRequest.followingId, followingUser.id))
    .where(and(eq(followRequest.followerId, myId), eq(followRequest.status, "accepted")));

  return Response.json({ ok: true, data: rows });
}
