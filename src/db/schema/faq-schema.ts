import {
	boolean,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

export const faq = pgTable("faq", {
	id: uuid("id").primaryKey().defaultRandom(),
	question: text("question").notNull(),
	answer: text("answer").notNull(),
	category: text("category"),
	order: integer("order").notNull().default(0),
	isPublished: boolean("is_published").notNull().default(true),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at")
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
});

export type Faq = typeof faq.$inferSelect;
export type NewFaq = typeof faq.$inferInsert;
