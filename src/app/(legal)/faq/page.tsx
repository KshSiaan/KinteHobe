import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { getPublishedFaqs } from "@/lib/faq";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "FAQ — Frequently Asked Questions",
	description:
		"Find answers to the most common questions about our platform, orders, and policies.",
	alternates: { canonical: "/faq" },
	openGraph: {
		title: "FAQ — Frequently Asked Questions",
		description:
			"Find answers to the most common questions about our platform, orders, and policies.",
		url: "/faq",
		type: "website",
	},
	robots: { index: true, follow: true },
};

export default async function FaqPage() {
	const faqs = await getPublishedFaqs();

	const grouped = faqs.reduce<Record<string, typeof faqs>>((acc, item) => {
		const key = item.category ?? "General";
		if (!acc[key]) acc[key] = [];
		acc[key].push(item);
		return acc;
	}, {});

	const categories = Object.keys(grouped);

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: faqs.map((f) => ({
			"@type": "Question",
			name: f.question,
			acceptedAnswer: {
				"@type": "Answer",
				text: f.answer,
			},
		})),
	};

	return (
		<>
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: trusted structured data
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<main className="w-full max-w-3xl mx-auto py-16 px-4">
				<header className="mb-12 text-center">
					<h1 className="text-4xl font-bold tracking-tight">
						Frequently Asked Questions
					</h1>
					<p className="mt-4 text-muted-foreground text-base max-w-xl mx-auto">
						Can&apos;t find the answer you&apos;re looking for?{" "}
						<a
							href="/me/support"
							className="underline underline-offset-4 hover:text-foreground transition-colors"
						>
							Contact support
						</a>
						.
					</p>
				</header>

				{faqs.length === 0 ? (
					<p className="text-center text-muted-foreground py-20">
						No FAQs available yet.
					</p>
				) : (
					<div className="flex flex-col gap-10">
						{categories.map((cat) => (
							<section key={cat}>
								{categories.length > 1 && (
									<h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
										{cat}
									</h2>
								)}
								<Accordion type="multiple">
									{grouped[cat].map((item) => (
										<AccordionItem key={item.id} value={item.id}>
											<AccordionTrigger className="text-base font-medium">
												{item.question}
											</AccordionTrigger>
											<AccordionContent className="text-muted-foreground leading-relaxed">
												{item.answer}
											</AccordionContent>
										</AccordionItem>
									))}
								</Accordion>
							</section>
						))}
					</div>
				)}
			</main>
		</>
	);
}
