import { order, orderItem, productVariant, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { and, asc, desc, eq, gte, lt, sql, sum } from "drizzle-orm";

const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const REVENUE_STATUSES = sql`'paid', 'processing', 'shipped', 'delivered'`;

export async function GET(request: Request) {
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session?.session?.token || session?.user?.role !== "admin") {
		return Response.json({ message: "Unauthorized" }, { status: 401 });
	}

	const now = new Date();
	const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
	const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
	const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
	const twelveMonthsAgo = new Date(Date.UTC(now.getUTCFullYear() - 1, now.getUTCMonth(), 1));

	const [
		userCountResult,
		revenueTodayResult,
		inventoryResult,
		revenueMonthResult,
		topCustomers,
		topProductRows,
		salesRows,
	] = await Promise.all([
		db
			.select({ count: sql<number>`count(*)::int` })
			.from(user)
			.where(eq(user.role, "user")),

		db
			.select({ totalCents: sql<number>`coalesce(sum(${order.totalCents}), 0)` })
			.from(order)
			.where(
				and(
					sql`${order.status} in (${REVENUE_STATUSES})`,
					gte(order.createdAt, todayStart),
					lt(order.createdAt, monthEnd),
				),
			),

		db
			.select({ total: sql<number>`coalesce(sum(${productVariant.stockQuantity}), 0)::int` })
			.from(productVariant)
			.where(eq(productVariant.enabled, true)),

		db
			.select({ totalCents: sql<number>`coalesce(sum(${order.totalCents}), 0)` })
			.from(order)
			.where(
				and(
					sql`${order.status} in (${REVENUE_STATUSES})`,
					gte(order.createdAt, monthStart),
					lt(order.createdAt, monthEnd),
				),
			),

		db
			.select({
				id: user.id,
				name: user.name,
				image: user.image,
				totalSpentCents: sql<number>`coalesce(sum(${order.totalCents}), 0)`,
			})
			.from(order)
			.innerJoin(user, eq(order.userId, user.id))
			.where(sql`${order.status} in (${REVENUE_STATUSES})`)
			.groupBy(user.id, user.name, user.image)
			.orderBy(desc(sum(order.totalCents)))
			.limit(3),

		db
			.select({
				productId: orderItem.productId,
				productTitle: orderItem.productTitle,
				variantTitle: orderItem.variantTitle,
				imageUrl: orderItem.imageUrl,
				unitsSold: sql<number>`sum(${orderItem.quantity})::int`,
				revenueCents: sql<number>`sum(${orderItem.lineTotalCents})`,
			})
			.from(orderItem)
			.innerJoin(order, eq(orderItem.orderId, order.id))
			.where(sql`${order.status} in (${REVENUE_STATUSES})`)
			.groupBy(
				orderItem.productId,
				orderItem.productTitle,
				orderItem.variantTitle,
				orderItem.imageUrl,
			)
			.orderBy(desc(sql`sum(${orderItem.quantity})`))
			.limit(1),

		db
			.select({
				monthKey: sql<string>`to_char(date_trunc('month', ${order.createdAt}), 'YYYY-MM')`,
				revenue: sql<number>`coalesce(sum(${order.totalCents}), 0)`,
				orderCount: sql<number>`count(*)::int`,
			})
			.from(order)
			.where(
				and(
					sql`${order.status} in (${REVENUE_STATUSES})`,
					gte(order.createdAt, twelveMonthsAgo),
				),
			)
			.groupBy(sql`date_trunc('month', ${order.createdAt})`)
			.orderBy(asc(sql`date_trunc('month', ${order.createdAt})`)),
	]);

	const salesMap = Object.fromEntries(salesRows.map((r) => [r.monthKey, r]));
	const monthlySales = Array.from({ length: 12 }, (_, i) => {
		const d = new Date(Date.UTC(now.getUTCFullYear() - 1, now.getUTCMonth() + 1 + i, 1));
		const year = d.getUTCFullYear();
		const month = d.getUTCMonth();
		const key = `${year}-${String(month + 1).padStart(2, "0")}`;
		const row = salesMap[key];
		return {
			date: d.toISOString(),
			label: `${MONTH_SHORT[month]} '${String(year).slice(2)}`,
			revenue: row ? Math.round(Number(row.revenue) / 100) : 0,
			orderCount: row ? Number(row.orderCount) : 0,
		};
	});

	return Response.json({
		kpis: {
			totalUsers: Number(userCountResult[0]?.count ?? 0),
			revenueTodayCents: Number(revenueTodayResult[0]?.totalCents ?? 0),
			inventoryCount: Number(inventoryResult[0]?.total ?? 0),
			revenueMonthCents: Number(revenueMonthResult[0]?.totalCents ?? 0),
		},
		monthlySales,
		topCustomers: topCustomers.map((c) => ({
			...c,
			totalSpentCents: Number(c.totalSpentCents),
		})),
		topProduct: topProductRows[0]
			? {
					...topProductRows[0],
					unitsSold: Number(topProductRows[0].unitsSold),
					revenueCents: Number(topProductRows[0].revenueCents),
				}
			: null,
	});
}
