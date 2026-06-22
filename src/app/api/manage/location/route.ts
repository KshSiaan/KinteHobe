import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userAddresses } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

const locationSchema = z.object({
  label: z.string().min(1),
  recipient_name: z.string().optional().nullable(),
  phone: z.string().min(1),
  district: z.string().min(1),
  city: z.string().min(1),
  area: z.string().min(1),
  address_line: z.string().min(1),
  is_default: z.boolean().optional(),
});

async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function GET() {
  const session = await getSession();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const addresses = await db
    .select()
    .from(userAddresses)
    .where(eq(userAddresses.userId, session.user.id));

  return Response.json({ data: addresses });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = locationSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  const { is_default, ...fields } = parsed.data;

  if (is_default) {
    await db
      .update(userAddresses)
      .set({ is_default: false })
      .where(eq(userAddresses.userId, session.user.id));
  }

  const [address] = await db
    .insert(userAddresses)
    .values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      ...fields,
      is_default: is_default ?? false,
    })
    .returning();

  return Response.json({ data: address }, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

  const body = await request.json();
  const parsed = locationSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  const { is_default, ...fields } = parsed.data;

  const existing = await db
    .select()
    .from(userAddresses)
    .where(and(eq(userAddresses.id, id), eq(userAddresses.userId, session.user.id)))
    .limit(1);

  if (!existing.length) return Response.json({ error: "Not found" }, { status: 404 });

  if (is_default) {
    await db
      .update(userAddresses)
      .set({ is_default: false })
      .where(eq(userAddresses.userId, session.user.id));
  }

  const [updated] = await db
    .update(userAddresses)
    .set({ ...fields, is_default: is_default ?? existing[0].is_default })
    .where(and(eq(userAddresses.id, id), eq(userAddresses.userId, session.user.id)))
    .returning();

  return Response.json({ data: updated });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

  const existing = await db
    .select()
    .from(userAddresses)
    .where(and(eq(userAddresses.id, id), eq(userAddresses.userId, session.user.id)))
    .limit(1);

  if (!existing.length) return Response.json({ error: "Not found" }, { status: 404 });

  await db
    .delete(userAddresses)
    .where(and(eq(userAddresses.id, id), eq(userAddresses.userId, session.user.id)));

  return Response.json({ success: true });
}
