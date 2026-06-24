import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const feedbackPriorityEnum = pgEnum("feedback_priority", [
	"low",
	"medium",
	"high",
	"urgent",
]);

export const managerFeedback = pgTable("manager_feedback", {
	id: uuid("id").primaryKey().defaultRandom(),
	managerId: text("manager_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	title: text("title").notNull(),
	subject: text("subject").notNull(),
	description: text("description").notNull(),
	priority: feedbackPriorityEnum("priority").notNull().default("medium"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at")
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
});

export type ManagerFeedback = typeof managerFeedback.$inferSelect;
export type FeedbackPriority = (typeof feedbackPriorityEnum.enumValues)[number];
