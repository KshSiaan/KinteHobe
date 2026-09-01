import { relations } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const followStatusEnum = pgEnum("follow_status", [
  "pending",
  "accepted",
  "rejected",
]);

export const followRelation = pgTable(
  "follow_relation",
  {
    id: text("id").primaryKey(),

    followerId: text("follower_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    followingId: text("following_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    status: followStatusEnum("status").default("pending").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    // One relationship per direction.
    unique("follow_relation_unique").on(table.followerId, table.followingId),

    index("follow_relation_follower_idx").on(table.followerId),

    index("follow_relation_following_idx").on(table.followingId),
  ],
);

export const followRelationRelations = relations(followRelation, ({ one }) => ({
  follower: one(user, {
    fields: [followRelation.followerId],
    references: [user.id],
    relationName: "followRelationFollower",
  }),

  following: one(user, {
    fields: [followRelation.followingId],
    references: [user.id],
    relationName: "followRelationFollowing",
  }),
}));
