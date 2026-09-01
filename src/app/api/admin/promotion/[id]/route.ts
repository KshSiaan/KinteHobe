import { promotion } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession(_request);
  if (session?.user.role !== "admin") {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  const deletedPromotion = await db
    .delete(promotion)
    .where(eq(promotion.id, id))
    .returning();

  if (!deletedPromotion) {
    return new Response("Promotion not found", { status: 404 });
  }

  return new Response(
    JSON.stringify({ message: "Promotion deleted successfully" }),
    {
      status: 200,
    },
  );
}
