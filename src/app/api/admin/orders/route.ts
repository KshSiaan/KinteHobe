import { order } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sql, and, eq, asc, desc } from "drizzle-orm";

export async function GET(request: Request) {
  const user = await auth.api.getSession({
    headers: request.headers,
  });

  if (!user?.session?.token || user?.user?.role !== "admin") {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const rawStatus = searchParams.get("status");
  const status =
    rawStatus && rawStatus !== "all" ? rawStatus : undefined;
  const filter = searchParams.get("filter") || undefined;
  const page = Math.max(Number(searchParams.get("page") || 1), 1);
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit") || 20), 1),
    100
  );
  const offset = (page - 1) * limit;

  const conditions = [
    status
      ? eq(
          order.status,
          status as
            | "pending_payment"
            | "paid"
            | "processing"
            | "shipped"
            | "delivered"
            | "cancelled"
            | "refunded"
        )
      : undefined,
    search
      ? sql`(${order.id}::text ILIKE ${`%${search}%`} OR ${order.email} ILIKE ${`%${search}%`} OR ${order.shippingName} ILIKE ${`%${search}%`})`
      : undefined,
  ];

  const orderBy =
    filter === "oldest"
      ? asc(order.createdAt)
      : filter === "low-to-high"
        ? asc(order.totalCents)
        : filter === "high-to-low"
          ? desc(order.totalCents)
          : desc(order.createdAt);

  const data = await db
    .select()
    .from(order)
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  const totalResult = await db
    .select({ count: db.$count(order) })
    .from(order);

  const total = totalResult?.[0]?.count ?? 0;

  const [stats] = await db
    .select({
      totalOrders: sql<number>`count(*)`,
      pendingPaymentCount: sql<number>`coalesce(sum(case when ${order.status} = 'pending_payment' then 1 else 0 end), 0)`,
      processingCount: sql<number>`coalesce(sum(case when ${order.status} in ('paid', 'processing', 'shipped') then 1 else 0 end), 0)`,
      deliveredCount: sql<number>`coalesce(sum(case when ${order.status} = 'delivered' then 1 else 0 end), 0)`,
      cancelledCount: sql<number>`coalesce(sum(case when ${order.status} in ('cancelled', 'refunded') then 1 else 0 end), 0)`,
    })
    .from(order);

  return new Response(
    JSON.stringify({
      data,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }),
    { status: 200 }
  );
}
