import { faq } from "@/db/schema";
import { db } from "@/lib/db";
import { asc, eq } from "drizzle-orm";

export async function getPublishedFaqs() {
	"use cache";
	return db
		.select()
		.from(faq)
		.where(eq(faq.isPublished, true))
		.orderBy(asc(faq.order), asc(faq.createdAt));
}
