import { productVisit, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { CreateResponse } from "@/lib/backend/message";
import { db } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
export async function GET(req: Request) {
  const session = await auth.api.getSession(req);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!session.user.role || session.user.role !== "admin") {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const res = await db
      .select()
      .from(productVisit)
      .leftJoin(user, eq(productVisit.visitorId, user.id))
      .orderBy(desc(productVisit.createdAt));

    return CreateResponse({
      message: "Product visits fetched successfully",
      status: 200,
      ok: true,
      additionalData: {
        data: res,
      },
    });
  } catch (error) {
    console.error("Error fetching product visits:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
