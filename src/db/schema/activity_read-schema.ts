import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

import { activity } from "./activity-schema";
import { user } from "../schema";

export const activityRead = pgTable(
  "activity_read",
  {
    id: text("id").primaryKey(),

    userId: text("user_id")
      .notNull()
      .references((): AnyPgColumn => user.id, {
        onDelete: "cascade",
      }),

    activityId: text("activity_id")
      .notNull()
      .references((): AnyPgColumn => activity.id, {
        onDelete: "cascade",
      }),

    readAt: timestamp("read_at").defaultNow().notNull(),
  },
  (table) => [
    index("activity_read_activity_idx").on(table.activityId),

    unique("activity_read_user_activity_unique").on(
      table.userId,
      table.activityId,
    ),
  ],
);

export const activityReadRelations = relations(activityRead, ({ one }) => ({
  activity: one(activity, {
    fields: [activityRead.activityId],
    references: [activity.id],
  }),

  user: one(user, {
    fields: [activityRead.userId],
    references: [user.id],
  }),
}));
