import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { followRequest, user } from "@/db/schema";
import { and, eq } from "drizzle-orm";

// GET /api/follow/pending — incoming pending requests for current user
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const pending = await db
    .select({
      id: followRequest.id,
      status: followRequest.status,
      createdAt: followRequest.createdAt,
      follower: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    })
    .from(followRequest)
    .innerJoin(user, eq(followRequest.followerId, user.id))
    .where(
      and(
        eq(followRequest.followingId, session.user.id),
        eq(followRequest.status, "pending"),
      ),
    );

  return Response.json({ ok: true, data: pending });
}
