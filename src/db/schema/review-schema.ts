import { pgTable, text, timestamp, index, numeric, real } from "drizzle-orm/pg-core";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { product, user } from "../schema";

export const review = pgTable("review", {
    id: text("id").primaryKey(),
    productId: text("product_id").references((): AnyPgColumn => product.id, {
        onDelete: "cascade",
    }),
    authorId: text("author_id").notNull().references((): AnyPgColumn => user.id, {
        onDelete: "cascade",
    }),
    ratingFloat: real("ratingFloat").default(0).notNull(),
    reviewText: text("reviewText").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
},
    (table) => [
        // Add indexes for productId and authorId for faster lookups
        index("review_productId_idx").on(table.productId),
        index("review_authorId_idx").on(table.authorId),
    ]
);