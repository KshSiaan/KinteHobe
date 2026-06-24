import { supportMessage } from "@/db/schema";
import { user } from "@/db/schema/auth-schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { desc, eq } from "drizzle-orm";

export async function GET(request: Request) {
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session?.user) {
		return Response.json({ message: "Unauthorized" }, { status: 401 });
	}

	if (session.user.role !== "admin" && session.user.role !== "manager") {
		return Response.json({ message: "Forbidden" }, { status: 403 });
	}

	const messages = await db
		.select({
			id: supportMessage.id,
			subject: supportMessage.subject,
			message: supportMessage.message,
			createdAt: supportMessage.createdAt,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				image: user.image,
			},
		})
		.from(supportMessage)
		.leftJoin(user, eq(supportMessage.userId, user.id))
		.orderBy(desc(supportMessage.createdAt));

	return Response.json({ messages }, { status: 200 });
}

export async function DELETE(request: Request) {
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session?.user) {
		return Response.json({ message: "Unauthorized" }, { status: 401 });
	}

	if (session.user.role !== "admin") {
		return Response.json({ message: "Forbidden" }, { status: 403 });
	}

	const { searchParams } = new URL(request.url);
	const id = searchParams.get("id");

	if (!id) {
		return Response.json({ message: "Missing id" }, { status: 400 });
	}

	await db.delete(supportMessage).where(eq(supportMessage.id, id));

	return Response.json({ message: "Deleted" }, { status: 200 });
}
