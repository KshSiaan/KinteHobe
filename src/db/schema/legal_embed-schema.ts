import { index, pgTable, text, uuid, vector } from "drizzle-orm/pg-core";
import { legalDocument } from "../schema";

export const legalEmbed = pgTable(
  "legal_embed",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1028 }).notNull(),
    document: uuid("document").references(() => legalDocument.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  },
  (table) => [
    index("embedding_vector_idx").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops"),
    ),
    index("legal_embed_document_idx").on(table.document),
  ],
);
