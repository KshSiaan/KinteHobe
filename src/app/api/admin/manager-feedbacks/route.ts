import { managerFeedback } from "@/db/schema";
import { user } from "@/db/schema/auth-schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { and, asc, desc, eq, ilike, or } from "drizzle-orm";

const PRIORITY_ORDER = {
	urgent: 0,
	high: 1,
	medium: 2,
	low: 3,
} as const;

export async function GET(request: Request) {
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session?.user) {
		return Response.json({ message: "Unauthorized" }, { status: 401 });
	}

	if (session.user.role !== "admin") {
		return Response.json({ message: "Forbidden" }, { status: 403 });
	}

	const { searchParams } = new URL(request.url);
	const search = searchParams.get("search")?.trim() ?? "";
	const priority = searchParams.get("priority") ?? "all";
	const sort = searchParams.get("sort") ?? "newest";

	const manager = user;

	const conditions = [];

	if (priority !== "all") {
		conditions.push(
			eq(
				managerFeedback.priority,
				priority as "low" | "medium" | "high" | "urgent",
			),
		);
	}

	if (search) {
		conditions.push(
			or(
				ilike(managerFeedback.title, `%${search}%`),
				ilike(manager.name, `%${search}%`),
				ilike(manager.email, `%${search}%`),
			),
		);
	}

	let orderBy;
	if (sort === "oldest") {
		orderBy = asc(managerFeedback.createdAt);
	} else if (sort === "priority-asc") {
		orderBy = asc(managerFeedback.priority);
	} else if (sort === "priority-desc") {
		orderBy = desc(managerFeedback.priority);
	} else {
		orderBy = desc(managerFeedback.createdAt);
	}

	const feedbacks = await db
		.select({
			id: managerFeedback.id,
			title: managerFeedback.title,
			subject: managerFeedback.subject,
			description: managerFeedback.description,
			priority: managerFeedback.priority,
			createdAt: managerFeedback.createdAt,
			updatedAt: managerFeedback.updatedAt,
			manager: {
				id: manager.id,
				name: manager.name,
				email: manager.email,
				image: manager.image,
			},
		})
		.from(managerFeedback)
		.leftJoin(manager, eq(managerFeedback.managerId, manager.id))
		.where(conditions.length > 0 ? and(...conditions) : undefined)
		.orderBy(orderBy);

	return Response.json({ feedbacks }, { status: 200 });
}
