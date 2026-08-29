import { relations, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";

import {
  boolean,
  customType,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { category } from "./category-schema";
import type { MetadataTableRow } from "@/lib/validations/metadata-table";


export const productStatusEnum = pgEnum("product_status", [
  "active",
  "draft",
  "archived",
]);

export const productVariantKindEnum = pgEnum("product_variant_kind", [
  "base",
  "color",
  "size",
  "custom",
]);

const tsvector = customType<{
  data: string;
  driverData: string;
}>({
  dataType() {
    return "tsvector";
  },
});

export const product = pgTable(
  "product",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),

    categoryId: text("category_id")
      .notNull()
      .references(() => category.id, { onDelete: "restrict" }),

    status: productStatusEnum("status").default("draft").notNull(),

    variantIds: jsonb("variant_ids").$type<string[]>().default([]).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("product_slug_idx").on(table.slug),
    index("product_category_idx").on(table.categoryId),
  ],
);

export const productVariant = pgTable(
  "product_variant",
  {
    id: text("id").primaryKey(),
    groupId: text("group_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    code: text("code"),

    sku: text("sku"),

    price: numeric("price", { precision: 12, scale: 2 }).notNull(),

    compareAtPrice: numeric("compare_at_price", {
      precision: 12,
      scale: 2,
    }),

    stockQuantity: integer("stock_quantity").notNull(),

    weight: text("weight"),

    details: text("details"),

    metadata: jsonb("metadata")
      .$type<MetadataTableRow[]>()
      .notNull()
      .default([]),

    position: integer("position").notNull().default(0),

    kind: productVariantKindEnum("kind").notNull(),

    enabled: boolean("enabled").default(true).notNull(),

    title: text("title"),

    optionName: text("option_name"),

    images: jsonb("images").$type<string[]>().notNull().default([]),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    bodySearch: tsvector("body_search")
      .notNull()
      .generatedAlwaysAs(
        (): SQL =>
          sql`to_tsvector(
            'english',
            coalesce("title", '') || ' ' || coalesce("details", '')
          )`,
      ),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("product_variant_group_idx").on(table.groupId),
    index("product_variant_body_search_idx").using(
      "gin",
      table.bodySearch,
    ),
  ],
);

export const productRelations = relations(product, ({ one, many }) => ({
  category: one(category, {
    fields: [product.categoryId],
    references: [category.id],
  }),
  variants: many(productVariant),
}));

export const productVariantRelations = relations(productVariant, ({ one }) => ({
  product: one(product, {
    fields: [productVariant.groupId],
    references: [product.id],
  }),
}));