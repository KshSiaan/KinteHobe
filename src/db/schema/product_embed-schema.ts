import { index, pgTable, text, uuid, vector } from "drizzle-orm/pg-core";
import { product } from "../schema";

export const productEmbed = pgTable(
  "product_embed",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1028 }).notNull(),
    productId: uuid("product_id").references(() => product.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  },
  (table) => [
    index("embedding_vector_idx").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops"),
    ),
    index("product_embed_product_id_idx").on(table.productId),
  ],
);
