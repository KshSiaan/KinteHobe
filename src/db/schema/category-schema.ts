import { pgTable, text, timestamp, boolean, integer} from "drizzle-orm/pg-core";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

export const category = pgTable("category", {
  id: text("id").primaryKey(),
  parentId: text("parent_id").references((): AnyPgColumn => category.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"), // <- also relaxed this, trust me
  image: text("image"),
  banner: text("banner"),

  isActive: boolean("is_active").default(true),

  metaTitle: text("meta_title").default(""),
  metaDescription: text("meta_description").default(""),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});