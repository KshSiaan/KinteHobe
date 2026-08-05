import {
  activity,
  activityRead,
  followRelation,
  notification,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { markAllNotificationsRead } from "@/lib/notifications";
import { sql } from "drizzle-orm";

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.session?.token) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const page = Math.max(Number(searchParams.get("page") || 1), 1);

  const limit = Math.min(
    Math.max(Number(searchParams.get("limit") || 20), 1),
    100,
  );

  const offset = (page - 1) * limit;
  const userId = session.user.id;

  const feed = await db.execute(sql`
    WITH unified_feed AS (
      /* =========================
       * NOTIFICATIONS
       * ========================= */
      SELECT
        ${notification.id} AS id,
        'notification'::text AS source,
        ${notification.type} AS type,
        ${notification.title} AS title,
        ${notification.body} AS body,

        NULL::text AS actor_id,
        NULL::text AS entity_id,

        ${notification.metadata} AS metadata,

        ${notification.createdAt} AS created_at,

        ${notification.isRead} AS is_read,

        ${notification.readAt} AS read_at

      FROM ${notification}

      WHERE ${notification.userId} = ${userId}


      UNION ALL


      /* =========================
       * ACTIVITIES
       * ========================= */
      SELECT
        ${activity.id} AS id,
        'activity'::text AS source,
        ${activity.type} AS type,

        NULL::text AS title,
        NULL::text AS body,

        ${activity.actorId} AS actor_id,
        ${activity.entityId} AS entity_id,

        ${activity.metaData} AS metadata,

        ${activity.createdAt} AS created_at,

        CASE
          WHEN ${activityRead.id} IS NOT NULL
          THEN true
          ELSE false
        END AS is_read,

        ${activityRead.readAt} AS read_at

      FROM ${activity}

      INNER JOIN ${followRelation}
        ON ${followRelation.followingId} = ${activity.actorId}

      LEFT JOIN ${activityRead}
        ON ${activityRead.activityId} = ${activity.id}
        AND ${activityRead.userId} = ${userId}

      WHERE ${followRelation.followerId} = ${userId}
        AND ${activity.actorId} != ${userId}
    )

    SELECT *
    FROM unified_feed

    ORDER BY created_at DESC

    LIMIT ${limit}
    OFFSET ${offset}
  `);

  const countResult = await db.execute(sql`
  SELECT COUNT(*)::int AS total
  FROM (
    SELECT ${notification.id}
    FROM ${notification}
    WHERE ${notification.userId} = ${userId}

    UNION ALL

    SELECT ${activity.id}
    FROM ${activity}
    INNER JOIN ${followRelation}
      ON ${followRelation.followingId} = ${activity.actorId}

    WHERE ${followRelation.followerId} = ${userId}
      AND ${activity.actorId} != ${userId}
  ) AS unified_count
`);

  const total = Number(countResult.rows[0]?.total ?? 0);

  const unreadResult = await db.execute(sql`
  SELECT COUNT(*)::int AS unread
  FROM (
    SELECT ${notification.id}
    FROM ${notification}
    WHERE ${notification.userId} = ${userId}
      AND ${notification.isRead} = false

    UNION ALL

    SELECT ${activity.id}
    FROM ${activity}
    INNER JOIN ${followRelation}
      ON ${followRelation.followingId} = ${activity.actorId}

    LEFT JOIN ${activityRead}
      ON ${activityRead.activityId} = ${activity.id}
      AND ${activityRead.userId} = ${userId}

    WHERE ${followRelation.followerId} = ${userId}
      AND ${activity.actorId} != ${userId}
      AND ${activityRead.id} IS NULL
  ) AS unread_feed
`);

  const unreadCount = Number(unreadResult.rows[0]?.unread ?? 0);

  return Response.json({
    data: feed.rows,
    unreadCount,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.session?.token) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  await db.transaction(async (tx) => {
    /*
     * 1. Mark direct notifications as read.
     */
    await markAllNotificationsRead(userId);

    /*
     * 2. Mark all currently visible activities as read.
     *
     * These are activities created by people the current
     * user follows.
     */
    await tx.execute(sql`
      INSERT INTO ${activityRead} (
        ${activityRead.id},
        ${activityRead.activityId},
        ${activityRead.userId},
        ${activityRead.readAt}
      )
      SELECT
        gen_random_uuid()::text,
        ${activity.id},
        ${userId},
        NOW()

      FROM ${activity}

      INNER JOIN ${followRelation}
        ON ${followRelation.followingId} = ${activity.actorId}

      LEFT JOIN ${activityRead}
        ON ${activityRead.activityId} = ${activity.id}
        AND ${activityRead.userId} = ${userId}

      WHERE ${followRelation.followerId} = ${userId}
        AND ${activity.actorId} != ${userId}
        AND ${activityRead.id} IS NULL
    `);
  });

  return Response.json({
    message: "All notifications and activities marked as read",
  });
}
