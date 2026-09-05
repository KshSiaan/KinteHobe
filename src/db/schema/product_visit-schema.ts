import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { product, user } from "../schema";

export const productVisit = pgTable(
  "product_visit",
  {
    id: text("id").primaryKey(),
    productId: text("product_id").references((): AnyPgColumn => product.id, {
      onDelete: "cascade",
    }),
    visitorId: text("visitor_id").references((): AnyPgColumn => user.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    // Add indexes for query and authorId for faster lookups
    index("product_visit_product_id_idx").on(table.productId),
    index("product_visit_visitor_id_idx").on(table.visitorId),
  ],
);
