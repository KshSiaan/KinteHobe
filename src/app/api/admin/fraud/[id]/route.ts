import { fraud} from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {eq} from "drizzle-orm";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
  const body = await request.json();
  const { id } = await params;
  const {status} = body;

  if (!id || !status) {
    return new Response(
      JSON.stringify({ message: "Missing required fields" }),
      { status: 400 }
    );
  }

  const updatedFraud = await db
    .update(fraud)
    .set({ current_status: status })
    .where(eq(fraud.id, id))
    .returning();

  if (!updatedFraud || updatedFraud.length === 0) {
    return new Response(
      JSON.stringify({ message: "Fraud record not found" }),
      { status: 404 }
    );
  }
  return new Response(
    JSON.stringify({ message: "Fraud record updated successfully", data: updatedFraud[0] }),
    { status: 200 }
  );

}