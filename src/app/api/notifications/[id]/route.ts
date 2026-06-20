import { notification } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { markNotificationRead } from "@/lib/notifications";
import { and, eq } from "drizzle-orm";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.session?.token) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [existing] = await db
    .select({ id: notification.id })
    .from(notification)
    .where(
      and(
        eq(notification.id, id),
        eq(notification.userId, session.user.id),
      ),
    );

  if (!existing) {
    return Response.json({ message: "Notification not found" }, { status: 404 });
  }

  const updated = await markNotificationRead(id, session.user.id);

  return Response.json({ data: updated, message: "Marked as read" });
}
