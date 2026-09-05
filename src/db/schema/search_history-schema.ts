import { pgTable, text, timestamp, index, real } from "drizzle-orm/pg-core";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { product, user } from "../schema";

export const searchHistory = pgTable(
  "search_history",
  {
    id: text("id").primaryKey(),
    query: text("query").notNull(),
    authorId: text("author_id").references((): AnyPgColumn => user.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    // Add indexes for query and authorId for faster lookups
    index("search_history_query_idx").on(table.query),
    index("search_history_authorId_idx").on(table.authorId),
  ],
);
