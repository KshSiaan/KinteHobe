import { notification } from "@/db/schema";
import { db } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";

type NotificationType =
  | "order_placed"
  | "order_status_changed"
  | "order_cancelled"
  | "order_refunded"
  | "order_delivered";

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
}

export async function createNotification(input: CreateNotificationInput) {
  const [created] = await db
    .insert(notification)
    .values({
      id: nanoid(),
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      metadata: input.metadata,
    })
    .returning();
  return created;
}

export async function markNotificationRead(notificationId: string, userId: string) {
  const [updated] = await db
    .update(notification)
    .set({ isRead: true, readAt: new Date() })
    .where(
      and(
        eq(notification.id, notificationId),
        eq(notification.userId, userId),
      ),
    )
    .returning();
  return updated;
}

export async function markAllNotificationsRead(userId: string) {
  await db
    .update(notification)
    .set({ isRead: true, readAt: new Date() })
    .where(
      and(eq(notification.userId, userId), eq(notification.isRead, false)),
    );
}
