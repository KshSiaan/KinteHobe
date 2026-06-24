import { faq } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateSchema = z.object({
	question: z.string().min(1).max(500).optional(),
	answer: z.string().min(1).optional(),
	category: z.string().max(100).optional().nullable(),
	order: z.number().int().optional(),
	isPublished: z.boolean().optional(),
});

async function requireAdmin(request: Request) {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) return { error: Response.json({ message: "Unauthorized" }, { status: 401 }) };
	if (session.user.role !== "admin") return { error: Response.json({ message: "Forbidden" }, { status: 403 }) };
	return { session };
}

export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const check = await requireAdmin(request);
	if (check.error) return check.error;

	const { id } = await params;
	const body = await request.json();
	const parsed = updateSchema.safeParse(body);
	if (!parsed.success) {
		return Response.json({ message: "Invalid request", issues: parsed.error.issues }, { status: 400 });
	}

	const [updated] = await db
		.update(faq)
		.set(parsed.data)
		.where(eq(faq.id, id))
		.returning();

	if (!updated) {
		return Response.json({ message: "Not found" }, { status: 404 });
	}

	return Response.json({ faq: updated }, { status: 200 });
}

export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const check = await requireAdmin(request);
	if (check.error) return check.error;

	const { id } = await params;
	await db.delete(faq).where(eq(faq.id, id));
	return Response.json({ message: "Deleted" }, { status: 200 });
}
