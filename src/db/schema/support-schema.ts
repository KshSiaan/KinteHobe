import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const supportMessage = pgTable("support_message", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	subject: text("subject").notNull(),
	message: text("message").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SupportMessage = typeof supportMessage.$inferSelect;
