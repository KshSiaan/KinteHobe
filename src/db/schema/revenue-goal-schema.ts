import { integer, pgTable, timestamp, unique, uuid } from "drizzle-orm/pg-core";

export const revenueGoal = pgTable(
	"revenue_goal",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		targetCents: integer("target_cents").notNull(),
		month: integer("month").notNull(),
		year: integer("year").notNull(),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at")
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		unique("revenue_goal_month_year_unique").on(table.month, table.year),
	],
);

export type RevenueGoal = typeof revenueGoal.$inferSelect;
