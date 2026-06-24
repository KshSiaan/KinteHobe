import { getPublishedFaqs } from "@/lib/faq";

export async function GET() {
	const faqs = await getPublishedFaqs();
	return Response.json({ faqs }, { status: 200 });
}
