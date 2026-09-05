import { searchHistory } from "@/db/schema";
import { auth } from "@/lib/auth";
import { CreateResponse } from "@/lib/backend/message";
import { db } from "@/lib/db";

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
      .from(searchHistory)
      .orderBy(searchHistory.createdAt);

    return CreateResponse({
      message: "Search history fetched successfully",
      status: 200,
      ok: true,
      additionalData: {
        data: res,
      },
    });
  } catch (error) {
    console.error("Error fetching search history:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
