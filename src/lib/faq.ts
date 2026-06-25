import { faq } from "@/db/schema";
import { db } from "@/lib/db";
import { asc, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export const getPublishedFaqs = unstable_cache(
	async () => {
		return db
			.select()
			.from(faq)
			.where(eq(faq.isPublished, true))
			.orderBy(asc(faq.order), asc(faq.createdAt));
	},
	["published-faqs"],
	{ revalidate: 300, tags: ["faqs"] },
);
