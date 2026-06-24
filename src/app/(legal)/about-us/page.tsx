import { getLegalContent, LEGAL_PAGE_META } from "@/lib/legal";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const TYPE = "about_us" as const;
const META = LEGAL_PAGE_META[TYPE];

export async function generateMetadata(): Promise<Metadata> {
	const content = await getLegalContent(TYPE);
	const title = content?.title || META.label;
	const description = content?.metaDescription || META.defaultDescription;
	return {
		title,
		description,
		alternates: { canonical: `/${META.slug}` },
		openGraph: {
			title,
			description,
			url: `/${META.slug}`,
			type: "website",
		},
		robots: { index: true, follow: true },
	};
}

export default async function AboutUsPage() {
	const content = await getLegalContent(TYPE);

	if (!content?.isPublished) return notFound();

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: content.title,
		description: content.metaDescription || META.defaultDescription,
		url: `/${META.slug}`,
		dateModified: content.updatedAt.toISOString(),
	};

	return (
		<>
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: trusted structured data
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<main className="w-full max-w-4xl mx-auto py-16 px-4 overflow-x-hidden">
				<article>
					<header className="mb-10">
						<h1 className="text-4xl font-bold tracking-tight">{content.title}</h1>
						<time
							dateTime={content.updatedAt.toISOString()}
							className="mt-3 block text-sm text-muted-foreground"
						>
							Last updated:{" "}
							{content.updatedAt.toLocaleDateString("en-US", {
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</time>
					</header>
					<div
						className="legal-content"
						// biome-ignore lint/security/noDangerouslySetInnerHtml: admin-authored content
						dangerouslySetInnerHTML={{ __html: content.content }}
					/>
				</article>
			</main>
		</>
	);
}
