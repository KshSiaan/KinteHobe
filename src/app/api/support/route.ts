import { supportMessage } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

const createSchema = z.object({
	subject: z.string().min(1).max(200),
	message: z.string().min(1).max(5000),
});

export async function POST(request: Request) {
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session?.user) {
		return Response.json({ message: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json();
	const parsed = createSchema.safeParse(body);

	if (!parsed.success) {
		return Response.json(
			{ message: "Invalid request", issues: parsed.error.issues },
			{ status: 400 },
		);
	}

	const msg = await db
		.insert(supportMessage)
		.values({
			userId: session.user.id,
			...parsed.data,
		})
		.returning();

	return Response.json({ message: msg[0] }, { status: 201 });
}

export async function GET(request: Request) {
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session?.user) {
		return Response.json({ message: "Unauthorized" }, { status: 401 });
	}

	const messages = await db
		.select()
		.from(supportMessage)
		.where(eq(supportMessage.userId, session.user.id))
		.orderBy(desc(supportMessage.createdAt));

	return Response.json({ messages }, { status: 200 });
}
