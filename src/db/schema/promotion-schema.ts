import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
export const promotion = pgTable("promotion", {
    id: text("id").primaryKey(),
    promotionTitle: text("promotion_title").notNull(),
    promotionUrl: text("promotion_url"),
    appearance: text("appearance").notNull(),
    variant: text("variant"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});