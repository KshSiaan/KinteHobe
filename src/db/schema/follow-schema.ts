import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, pgEnum, index, unique } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const followStatusEnum = pgEnum("follow_status", ["pending", "accepted", "rejected"]);

export const followRequest = pgTable(
  "follow_request",
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
    unique("follow_request_unique").on(table.followerId, table.followingId),
    index("follow_request_follower_idx").on(table.followerId),
    index("follow_request_following_idx").on(table.followingId),
  ],
);

export const followRequestRelations = relations(followRequest, ({ one }) => ({
  follower: one(user, {
    fields: [followRequest.followerId],
    references: [user.id],
    relationName: "follower",
  }),
  following: one(user, {
    fields: [followRequest.followingId],
    references: [user.id],
    relationName: "following",
  }),
}));
