import { faq } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { asc } from "drizzle-orm";
import { z } from "zod";

const faqSchema = z.object({
	question: z.string().min(1).max(500),
	answer: z.string().min(1),
	category: z.string().max(100).optional().nullable(),
	order: z.number().int().default(0),
	isPublished: z.boolean().default(true),
});

async function requireAdmin(request: Request) {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) return { error: Response.json({ message: "Unauthorized" }, { status: 401 }) };
	if (session.user.role !== "admin") return { error: Response.json({ message: "Forbidden" }, { status: 403 }) };
	return { session };
}

export async function GET(request: Request) {
	const check = await requireAdmin(request);
	if (check.error) return check.error;

	const faqs = await db
		.select()
		.from(faq)
		.orderBy(asc(faq.order), asc(faq.createdAt));

	return Response.json({ faqs }, { status: 200 });
}

export async function POST(request: Request) {
	const check = await requireAdmin(request);
	if (check.error) return check.error;

	const body = await request.json();
	const parsed = faqSchema.safeParse(body);
	if (!parsed.success) {
		return Response.json({ message: "Invalid request", issues: parsed.error.issues }, { status: 400 });
	}

	const [created] = await db.insert(faq).values(parsed.data).returning();
	return Response.json({ faq: created }, { status: 201 });
}
