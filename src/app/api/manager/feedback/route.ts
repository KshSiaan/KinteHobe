import { managerFeedback } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

const createSchema = z.object({
	title: z.string().min(1).max(200),
	subject: z.string().min(1).max(200),
	description: z.string().min(1),
	priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
});

export async function POST(request: Request) {
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session?.user) {
		return Response.json({ message: "Unauthorized" }, { status: 401 });
	}

	if (session.user.role !== "manager") {
		return Response.json({ message: "Forbidden" }, { status: 403 });
	}

	const body = await request.json();
	const parsed = createSchema.safeParse(body);

	if (!parsed.success) {
		return Response.json(
			{ message: "Invalid request", issues: parsed.error.issues },
			{ status: 400 },
		);
	}

	const feedback = await db
		.insert(managerFeedback)
		.values({
			managerId: session.user.id,
			...parsed.data,
		})
		.returning();

	return Response.json({ feedback: feedback[0] }, { status: 201 });
}

export async function GET(request: Request) {
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session?.user) {
		return Response.json({ message: "Unauthorized" }, { status: 401 });
	}

	if (session.user.role !== "manager") {
		return Response.json({ message: "Forbidden" }, { status: 403 });
	}

	const feedbacks = await db
		.select()
		.from(managerFeedback)
		.where(eq(managerFeedback.managerId, session.user.id))
		.orderBy(desc(managerFeedback.createdAt));

	return Response.json({ feedbacks }, { status: 200 });
}

export async function DELETE(request: Request) {
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session?.user) {
		return Response.json({ message: "Unauthorized" }, { status: 401 });
	}

	if (session.user.role !== "manager") {
		return Response.json({ message: "Forbidden" }, { status: 403 });
	}

	const { searchParams } = new URL(request.url);
	const id = searchParams.get("id");

	if (!id) {
		return Response.json({ message: "Missing id" }, { status: 400 });
	}

	const deleted = await db
		.delete(managerFeedback)
		.where(
			and(
				eq(managerFeedback.id, id),
				eq(managerFeedback.managerId, session.user.id),
			),
		)
		.returning();

	if (deleted.length === 0) {
		return Response.json({ message: "Not found" }, { status: 404 });
	}

	return Response.json({ message: "Deleted" }, { status: 200 });
}
