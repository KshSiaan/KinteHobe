import { fraud, order, transaction, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sql,and,eq, desc} from "drizzle-orm";
import { getTableColumns } from "drizzle-orm";
export async function GET(request: Request) {
  const userSession = await auth.api.getSession({
    headers: request.headers,
  });

  if (
    !userSession?.session?.token ||
    !userSession?.user?.role ||
    !["admin", "manager"].includes(userSession?.user?.role)
  ) {
    return new Response(
      JSON.stringify({ message: "Unauthorized" }),
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const rawStatus = searchParams.get("status");
  const status = rawStatus && rawStatus !== "all" ? rawStatus : undefined;
  const page = Math.max(Number(searchParams.get("page") || 1), 1);
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit") || 20), 1),
    100
  );

  const offset = (page - 1) * limit;

  const conditions = [
  status ? eq(fraud.current_status, status as "pending" | "reviewed" | "resolved" | "rejected") : undefined,
  search
    ? sql`${fraud.id}::text ILIKE ${`%${search}%`}`
    : undefined,
];

const data = await db
  .select({
    ...getTableColumns(fraud),
    transaction,
    order,
    user,
  })
  .from(fraud)
  .leftJoin(
    transaction,
    eq(fraud.transactionId, transaction.id)
  )
  .leftJoin(
    order,
    eq(transaction.orderId, order.id)
  )
  .leftJoin(
  user,
  eq(order.userId, user.id)
)
  .where(and(...conditions))
  .orderBy(desc(fraud.createdAt))
  .limit(limit)
  .offset(offset);

  // optional: total count for pagination UI
  const totalResult = await db
    .select({ count: db.$count(fraud) })
    .from(fraud);

  const total = totalResult?.[0]?.count ?? 0;

const [stats] = await db.select({
    total_records: sql<number>`count(*)`,
    reviewedCount: sql<number>`coalesce(sum(case when ${fraud.current_status} = 'reviewed' then 1 else 0 end), 0)`,
    resolvedCount: sql<number>`coalesce(sum(case when ${fraud.current_status} = 'resolved' then 1 else 0 end), 0)`,
    rejectedCount: sql<number>`coalesce(sum(case when ${fraud.current_status} = 'rejected' then 1 else 0 end), 0)`,
}).from(fraud);
  
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
