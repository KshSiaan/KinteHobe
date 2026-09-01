import { productVariant } from "@/db/schema";
import { CreateResponse } from "@/lib/backend/message";
import { db } from "@/lib/db";
import { createSupabaseStorageClient } from "@/lib/storage/supabase";
import { getTableColumns, sql } from "drizzle-orm";

function toProductPublicUrl(path: string) {
  return createSupabaseStorageClient()
    .storage.from("product")
    .getPublicUrl(path).data.publicUrl;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q?.trim()) {
    return new Response("Missing search query", { status: 400 });
  }

  const searchQuery = q
    .trim()
    .split(/\s+/)
    .map((word) => `${word}:*`)
    .join(" & ");

  const res = await db
    .select({
      ...getTableColumns(productVariant),
      rank: sql<number>`
        ts_rank(
          ${productVariant.bodySearch},
          to_tsquery('english', ${searchQuery})
        )
      `.as("rank"),
    })
    .from(productVariant)
    .where(
      sql`${productVariant.bodySearch} @@ to_tsquery('english', ${searchQuery})`,
    )
    .orderBy(sql`rank DESC`)
    .limit(5);

  const data = res.map((product) => ({
    ...product,
    publicImages: product.images.map(toProductPublicUrl),
  }));

  return CreateResponse({
    status: 200,
    message: "Search results fetched successfully",
    additionalData: {
      q,
      data,
    },
  });
}
