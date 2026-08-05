
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { followRelation } from "@/db/schema";
import { and, eq, or } from "drizzle-orm";

// GET /api/follow/status/[userId]
// Returns the relationship between the current user and the target user.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
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

  const { userId } = await params;
  const myId = session.user.id;

  if (userId === myId) {
    return Response.json({
      ok: true,
      data: {
        status: "self",
        requestId: null,
      },
    });
  }

  const record = await db.query.followRelation.findFirst({
    where: or(
      and(
        eq(followRelation.followerId, myId),
        eq(followRelation.followingId, userId),
      ),
      and(
        eq(followRelation.followerId, userId),
        eq(followRelation.followingId, myId),
      ),
    ),
  });

  if (!record) {
    return Response.json({
      ok: true,
      data: {
        status: "none",
        requestId: null,
      },
    });
  }

  return Response.json({
    ok: true,
    data: {
      status: record.status,
      requestId: record.id,
    },
  });
}

