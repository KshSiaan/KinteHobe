import { boolean, integer, pgEnum, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const legalPageTypeEnum = pgEnum("legal_page_type", [
	"about_us",
	"terms_of_service",
	"privacy_policy",
	"cookie_policy",
]);

export const legalDocument = pgTable("legal_document", {
	id: uuid("id").primaryKey().defaultRandom(),
	pageType: legalPageTypeEnum("page_type").notNull(),
	fileName: text("file_name").notNull(),
	filePath: text("file_path").notNull(),
	fileSize: integer("file_size").notNull(),
	isActive: boolean("is_active").notNull().default(false),
	uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
	uploadedBy: text("uploaded_by").references(() => user.id, { onDelete: "set null" }),
});

export const legalContent = pgTable(
	"legal_content",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		pageType: legalPageTypeEnum("page_type").notNull(),
		title: text("title").notNull().default(""),
		content: text("content").notNull().default(""),
		metaDescription: text("meta_description").notNull().default(""),
		isPublished: boolean("is_published").notNull().default(false),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
		updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
	},
	(t) => [unique("legal_content_page_type_unique").on(t.pageType)],
);

export type LegalDocument = typeof legalDocument.$inferSelect;
export type LegalContent = typeof legalContent.$inferSelect;
export type LegalPageType = (typeof legalPageTypeEnum.enumValues)[number];
