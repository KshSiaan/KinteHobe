import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { followRequest } from "@/db/schema";
import { and, eq } from "drizzle-orm";

// GET /api/follow/status/[userId] — relationship between current user and target
export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await params;
  const myId = session.user.id;

  const record = await db.query.followRequest.findFirst({
    where: and(
      eq(followRequest.followerId, myId),
      eq(followRequest.followingId, userId),
    ),
  });

  // "none" | "pending" | "accepted" | "rejected"
  return Response.json({ ok: true, data: { status: record?.status ?? "none", requestId: record?.id ?? null } });
}
