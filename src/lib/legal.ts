import { legalContent } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import type { LegalPageType } from "@/db/schema";
import { unstable_cache } from "next/cache";

export const getLegalContent = unstable_cache(
	async (type: LegalPageType) => {
		const [row] = await db
			.select()
			.from(legalContent)
			.where(eq(legalContent.pageType, type))
			.limit(1);
		return row ?? null;
	},
	["legal-content"],
	{ revalidate: 300, tags: ["legal"] },
);

export const LEGAL_PAGE_META: Record<
	LegalPageType,
	{ slug: string; label: string; defaultDescription: string }
> = {
	about_us: {
		slug: "about-us",
		label: "About Us",
		defaultDescription: "Learn more about our company and mission.",
	},
	terms_of_service: {
		slug: "terms-of-service",
		label: "Terms of Service",
		defaultDescription: "Read our terms and conditions of service.",
	},
	privacy_policy: {
		slug: "privacy-policy",
		label: "Privacy Policy",
		defaultDescription:
			"How we collect, use, and protect your personal data.",
	},
	cookie_policy: {
		slug: "cookie-policy",
		label: "Cookie Policy",
		defaultDescription: "How we use cookies on our website.",
	},
};
