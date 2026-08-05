import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { followRelation, user } from "@/db/schema";
import { and, eq } from "drizzle-orm";

// GET /api/follow/pending
// Incoming pending follow requests for the current user.
export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return Response.json(
      {
        ok: false,
        message: "Unauthorized",
      },
      { status: 401 },
    );
  }

  const pending = await db
    .select({
      id: followRelation.id,
      status: followRelation.status,
      createdAt: followRelation.createdAt,

      follower: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    })
    .from(followRelation)
    .innerJoin(
      user,
      eq(followRelation.followerId, user.id),
    )
    .where(
      and(
        eq(followRelation.followingId, session.user.id),
        eq(followRelation.status, "pending"),
      ),
    );

  return Response.json({
    ok: true,
    data: pending,
  });
}