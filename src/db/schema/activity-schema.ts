import { relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

import { activityRead, user } from "../schema";

export const activityTypeEnum = pgEnum("activity_type", [
  "order_placed",
  "review_submitted",
]);

export const activity = pgTable(
  "activity",
  {
    id: text("id").primaryKey(),
    actorId: text("actor_id")
      .notNull()
      .references((): AnyPgColumn => user.id, {
        onDelete: "cascade",
      }),
    type: activityTypeEnum("type").notNull(),
    entityId: text("entity_id").notNull(),
    metaData: jsonb("meta_data").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("activity_user_created_idx").on(table.actorId, table.createdAt),
  ],
);

export const activityRelations = relations(activity, ({ one, many }) => ({
  actor: one(user, {
    fields: [activity.actorId],
    references: [user.id],
  }),

  reads: many(activityRead),
}));
