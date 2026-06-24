import { order, revenueGoal } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { and, eq, gte, lt, sql } from "drizzle-orm";

function getCurrentMonthRange() {
	const now = new Date();
	const month = now.getUTCMonth() + 1;
	const year = now.getUTCFullYear();
	const start = new Date(Date.UTC(year, month - 1, 1));
	const end = new Date(Date.UTC(year, month, 1));
	return { month, year, start, end };
}

export async function GET(request: Request) {
	const session = await auth.api.getSession({ headers: request.headers });

	if (
		!session?.session?.token ||
		!session?.user?.role ||
		!["admin", "manager"].includes(session.user.role)
	) {
		return Response.json({ message: "Unauthorized" }, { status: 401 });
	}

	const { month, year, start, end } = getCurrentMonthRange();

	const [goal] = await db
		.select()
		.from(revenueGoal)
		.where(and(eq(revenueGoal.month, month), eq(revenueGoal.year, year)))
		.limit(1);

	const [revenueResult] = await db
		.select({
			totalCents: sql<number>`coalesce(sum(${order.totalCents}), 0)`,
		})
		.from(order)
		.where(
			and(
				sql`${order.status} in ('paid', 'processing', 'shipped', 'delivered')`,
				gte(order.createdAt, start),
				lt(order.createdAt, end),
			),
		);

	return Response.json({
		goal: goal ?? null,
		actualCents: Number(revenueResult?.totalCents ?? 0),
		month,
		year,
	});
}

export async function PUT(request: Request) {
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session?.session?.token || session?.user?.role !== "admin") {
		return Response.json({ message: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json().catch(() => null);
	const targetCents = body?.targetCents;

	if (
		typeof targetCents !== "number" ||
		targetCents <= 0 ||
		!Number.isInteger(targetCents)
	) {
		return Response.json(
			{ message: "targetCents must be a positive integer" },
			{ status: 400 },
		);
	}

	const { month, year } = getCurrentMonthRange();

	const [result] = await db
		.insert(revenueGoal)
		.values({ targetCents, month, year })
		.onConflictDoUpdate({
			target: [revenueGoal.month, revenueGoal.year],
			set: { targetCents, updatedAt: new Date() },
		})
		.returning();

	return Response.json({ goal: result });
}
