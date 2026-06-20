import { notification } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { markAllNotificationsRead } from "@/lib/notifications";
import { desc, eq, sql } from "drizzle-orm";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.session?.token) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(Number(searchParams.get("page") || 1), 1);
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || 20), 1), 100);
  const offset = (page - 1) * limit;

  const [data, [totals]] = await Promise.all([
    db
      .select()
      .from(notification)
      .where(eq(notification.userId, session.user.id))
      .orderBy(desc(notification.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({
        total: sql<number>`count(*)`,
        unread: sql<number>`coalesce(sum(case when ${notification.isRead} = false then 1 else 0 end), 0)`,
      })
      .from(notification)
      .where(eq(notification.userId, session.user.id)),
  ]);

  return Response.json({
    data,
    unreadCount: Number(totals.unread),
    pagination: {
      page,
      limit,
      total: Number(totals.total),
      totalPages: Math.ceil(Number(totals.total) / limit),
    },
  });
}

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.session?.token) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  await markAllNotificationsRead(session.user.id);

  return Response.json({ message: "All notifications marked as read" });
}
