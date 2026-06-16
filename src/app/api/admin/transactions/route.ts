import { transaction } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sql,and,eq, asc, desc} from "drizzle-orm";

export async function GET(request: Request) {
  const user = await auth.api.getSession({
    headers: request.headers,
  });

  if (!user?.session?.token || user?.user?.role !== "admin") {
    return new Response(
      JSON.stringify({ message: "Unauthorized" }),
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const rawStatus = searchParams.get("status");
  const status = rawStatus && rawStatus !== "all" ? rawStatus : undefined;
  const filter = searchParams.get("filter") || undefined;
  const page = Math.max(Number(searchParams.get("page") || 1), 1);
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit") || 20), 1),
    100
  );

  const offset = (page - 1) * limit;

  const conditions = [
  status ? eq(transaction.status, status as "pending" | "refunded" | "succeeded" | "failed") : undefined,
  search
    ? sql`${transaction.id}::text ILIKE ${`%${search}%`}`
    : undefined,
];

const order =
  filter === "oldest"
    ? asc(transaction.createdAt)
    : filter === "low-to-high"
      ? asc(transaction.amountCents)
      : filter === "high-to-low"
        ? desc(transaction.amountCents)
        : desc(transaction.createdAt);

const data = await db
  .select()
  .from(transaction)
  .where(and(...conditions))
  .orderBy(order)
    .limit(limit)
    .offset(offset);

  // optional: total count for pagination UI
  const totalResult = await db
    .select({ count: db.$count(transaction) })
    .from(transaction);

  const total = totalResult?.[0]?.count ?? 0;

const [stats] = await db.select({
  totalVolume: sql<number>`coalesce(sum(${transaction.amountCents}), 0)`,
    completedCount: sql<number>`coalesce(sum(case when ${transaction.status} = 'succeeded' then 1 else 0 end), 0)`,
    pendingCount: sql<number>`coalesce(sum(case when ${transaction.status} = 'pending' then 1 else 0 end), 0)`,
    failedCount: sql<number>`coalesce(sum(case when ${transaction.status} = 'failed' then 1 else 0 end), 0)`,
}).from(transaction);
  
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