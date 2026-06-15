import {
  pgTable,
  text,
  timestamp,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { product, user } from "../schema";

export const wishlist = pgTable(
  "wishlist",
  {
    id: text("id").primaryKey(),

    productId: text("product_id")
      .notNull()
      .references(() => product.id, {
        onDelete: "cascade",
      }),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("wishlist_productId_idx").on(table.productId),
    index("wishlist_userId_idx").on(table.userId),

    unique("wishlist_user_product_unique").on(
      table.userId,
      table.productId
    ),
  ]
);