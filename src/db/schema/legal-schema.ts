import { boolean, integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
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

export type LegalDocument = typeof legalDocument.$inferSelect;
export type LegalPageType = (typeof legalPageTypeEnum.enumValues)[number];
