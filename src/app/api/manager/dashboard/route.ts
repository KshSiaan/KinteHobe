import { order, productVariant, transaction, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";

const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export async function GET(request: Request) {
	const session = await auth.api.getSession({ headers: request.headers });

	if (
		!session?.session?.token ||
		!session?.user?.role ||
		!["admin", "manager"].includes(session.user.role)
	) {
		return Response.json({ message: "Unauthorized" }, { status: 401 });
	}

	const now = new Date();
	const todayStart = new Date(
		Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
	);
	const monthStart = new Date(
		Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
	);
	// first of the month 12 months ago (inclusive)
	const twelveMonthsAgo = new Date(
		Date.UTC(now.getUTCFullYear() - 1, now.getUTCMonth(), 1),
	);

	const [
		customerResult,
		ordersTodayResult,
		revenueResult,
		pendingResult,
		recentOrders,
		pipelineRows,
		lowStockRows,
		salesRows,
	] = await Promise.all([
		db
			.select({ count: sql<number>`count(*)::int` })
			.from(user)
			.where(eq(user.role, "user")),

		db
			.select({ count: sql<number>`count(*)::int` })
			.from(order)
			.where(
				and(
					gte(order.createdAt, todayStart),
					sql`${order.status} != 'pending_payment'`,
				),
			),

		db
			.select({
				totalCents: sql<number>`coalesce(sum(${transaction.amountCents}), 0)`,
			})
			.from(transaction)
			.where(
				and(
					eq(transaction.status, "succeeded"),
					gte(transaction.createdAt, monthStart),
				),
			),

		db
			.select({ count: sql<number>`count(*)::int` })
			.from(order)
			.where(sql`${order.status} in ('paid', 'processing')`),

		db
			.select({
				id: order.id,
				shippingName: order.shippingName,
				totalCents: order.totalCents,
				status: order.status,
				createdAt: order.createdAt,
			})
			.from(order)
			.orderBy(desc(order.createdAt))
			.limit(5),

		db
			.select({
				status: order.status,
				count: sql<number>`count(*)::int`,
			})
			.from(order)
			.groupBy(order.status),

		db
			.select({
				id: productVariant.id,
				title: productVariant.title,
				sku: productVariant.sku,
				stockQuantity: productVariant.stockQuantity,
			})
			.from(productVariant)
			.where(
				and(
					lte(productVariant.stockQuantity, 20),
					eq(productVariant.enabled, true),
				),
			)
			.orderBy(asc(productVariant.stockQuantity))
			.limit(6),

		// Monthly revenue grouped by month for the last 12 months
		db
			.select({
				monthKey: sql<string>`to_char(date_trunc('month', ${order.createdAt}), 'YYYY-MM')`,
				revenue: sql<number>`coalesce(sum(${order.totalCents}), 0)`,
				orderCount: sql<number>`count(*)::int`,
			})
			.from(order)
			.where(
				and(
					sql`${order.status} in ('paid', 'processing', 'shipped', 'delivered')`,
					gte(order.createdAt, twelveMonthsAgo),
				),
			)
			.groupBy(sql`date_trunc('month', ${order.createdAt})`)
			.orderBy(asc(sql`date_trunc('month', ${order.createdAt})`)),
	]);

	// Build a lookup from "YYYY-MM" → row
	const salesMap = Object.fromEntries(
		salesRows.map((r) => [r.monthKey, r]),
	);

	// Generate all 12 months oldest→newest, gap-filling zeros
	const monthlySales = Array.from({ length: 12 }, (_, i) => {
		const d = new Date(
			Date.UTC(now.getUTCFullYear() - 1, now.getUTCMonth() + 1 + i, 1),
		);
		const year = d.getUTCFullYear();
		const month = d.getUTCMonth(); // 0-based
		const key = `${year}-${String(month + 1).padStart(2, "0")}`;
		const row = salesMap[key];
		return {
			date: d.toISOString(),
			label: `${MONTH_SHORT[month]} '${String(year).slice(2)}`,
			revenue: row ? Math.round(Number(row.revenue) / 100) : 0,
			orderCount: row ? Number(row.orderCount) : 0,
		};
	});

	const orderPipeline = Object.fromEntries(
		pipelineRows.map((r) => [r.status, Number(r.count)]),
	);

	return Response.json({
		kpis: {
			totalCustomers: Number(customerResult[0]?.count ?? 0),
			ordersToday: Number(ordersTodayResult[0]?.count ?? 0),
			revenueThisMonthCents: Number(revenueResult[0]?.totalCents ?? 0),
			pendingOrders: Number(pendingResult[0]?.count ?? 0),
		},
		recentOrders,
		orderPipeline,
		lowStock: lowStockRows,
		monthlySales,
	});
}
