import { category, product, productEmbed, productVariant } from "@/db/schema";
import { auth } from "@/lib/auth";
import { CreateResponse } from "@/lib/backend/message";
import { db } from "@/lib/db";
import { createSupabaseStorageClient } from "@/lib/storage/supabase";
import { productCreatePayloadSchema } from "@/lib/validations/product-create";
import { asc, eq } from "drizzle-orm";

function toProductPublicUrl(path: string) {
  return createSupabaseStorageClient()
    .storage.from("product")
    .getPublicUrl(path).data.publicUrl;
}

function toCategoryPublicUrl(path: string | null | undefined) {
  if (!path) return null;
  return createSupabaseStorageClient()
    .storage.from("category")
    .getPublicUrl(path).data.publicUrl;
}

async function uploadFiles(files: File[], folder: string) {
  const storage = createSupabaseStorageClient().storage.from("product");
  const paths: string[] = [];

  for (const [index, file] of files.entries()) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${folder}/${Date.now()}_${index}_${safeName}`;
    const { data, error } = await storage.upload(
      path,
      await file.arrayBuffer(),
      {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      },
    );
    if (error || !data)
      throw new Error(error?.message || "Image upload failed");
    paths.push(data.path);
  }

  return paths;
}

async function cleanupFiles(paths: string[]) {
  if (paths.length > 0) {
    await createSupabaseStorageClient().storage.from("product").remove(paths);
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const rows = await db
    .select({ product, category, variant: productVariant })
    .from(product)
    .leftJoin(category, eq(product.categoryId, category.id))
    .leftJoin(productVariant, eq(product.id, productVariant.groupId))
    .where(eq(product.id, id))
    .orderBy(asc(productVariant.position));

  if (!rows.length) {
    return Response.json({ message: "Product not found" }, { status: 404 });
  }

  const first = rows[0];
  return CreateResponse({
    message: "Product fetched successfully",
    ok: true,
    status: 200,
    additionalData: {
      data: {
        product: first.product,
        category: first.category
          ? {
              ...first.category,
              image: toCategoryPublicUrl(first.category.image),
              banner: toCategoryPublicUrl(first.category.banner),
            }
          : null,
        variants: rows
          .map((row) => row.variant)
          .filter(
            (variant): variant is NonNullable<typeof variant> => !!variant,
          )
          .map((variant) => ({
            ...variant,
            publicImages: variant.images.map(toProductPublicUrl),
          })),
      },
    },
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.session) {
    return CreateResponse({ message: "Unauthorized", status: 401 });
  }

  const uploadedPaths: string[] = [];
  try {
    const formData = await request.formData();
    const rawPayload = formData.get("payload");
    if (typeof rawPayload !== "string") {
      return CreateResponse({
        message: "Payload must be a string",
        status: 400,
      });
    }

    const parsed = productCreatePayloadSchema.safeParse(JSON.parse(rawPayload));
    if (!parsed.success) {
      return CreateResponse({ message: "Validation failed", status: 400 });
    }

    const payload = parsed.data;
    const existing = await db
      .select()
      .from(productVariant)
      .where(eq(productVariant.groupId, id));
    const existingById = new Map(
      existing.map((variant) => [variant.id, variant]),
    );
    const baseFiles = formData
      .getAll("baseImages")
      .filter((value): value is File => value instanceof File);
    const colorFiles = formData
      .getAll("colorImages")
      .filter((value): value is File => value instanceof File);
    const customFiles = formData
      .getAll("customImages")
      .filter((value): value is File => value instanceof File);
    const baseImages = baseFiles.length
      ? await uploadFiles(baseFiles, `product/${id}/base`)
      : [];
    uploadedPaths.push(...baseImages);
    let colorCursor = 0;
    let customCursor = 0;
    const oldBase = existing.find((variant) => variant.kind === "base");
    const colorVariants = [];
    for (const [index, item] of (payload.color?.dataset ?? []).entries()) {
      const images = item.images.length
        ? await uploadFiles(
            colorFiles.slice(colorCursor, colorCursor + item.images.length),
            `product/${id}/color/${item.id}`,
          )
        : (existingById.get(item.id)?.images ?? []);
      colorCursor += item.images.length;
      uploadedPaths.push(...images);
      colorVariants.push({
        id: item.id,
        kind: "color" as const,
        title: item.colorName,
        code: item.colorValue,
        optionName: null,
        sku: item.sku ?? null,
        price: String(item.price),
        compareAtPrice:
          item.compareAtPrice == null ? null : String(item.compareAtPrice),
        stockQuantity: item.stockQuantity,
        weight: null,
        details: item.details ?? null,
        metadata: item.metadataRows,
        images,
        position: index + 1,
        enabled: payload.color?.enabled ?? false,
      });
    }
    const customVariants = [];
    for (const [groupIndex, group] of (
      payload.custom?.dataset ?? []
    ).entries()) {
      for (const [optionIndex, item] of group.options.entries()) {
        const images = item.images.length
          ? await uploadFiles(
              customFiles.slice(
                customCursor,
                customCursor + item.images.length,
              ),
              `product/${id}/custom/${group.groupId}/${item.id}`,
            )
          : (existingById.get(item.id)?.images ?? []);
        customCursor += item.images.length;
        uploadedPaths.push(...images);
        customVariants.push({
          id: item.id,
          kind: "custom" as const,
          title: group.groupTitle,
          code: item.optionCode ?? null,
          optionName: item.optionName,
          sku: item.sku ?? null,
          price: String(item.price),
          compareAtPrice:
            item.compareAtPrice == null ? null : String(item.compareAtPrice),
          stockQuantity: item.stockQuantity,
          weight: item.weight == null ? null : String(item.weight),
          details: item.details ?? null,
          metadata: item.metadataRows,
          images,
          position: groupIndex + optionIndex + 1,
          enabled: payload.custom?.enabled ?? false,
        });
      }
    }
    const variants = [
      {
        id: oldBase?.id ?? crypto.randomUUID(),
        kind: "base" as const,
        title: payload.base.title,
        code: null,
        optionName: null,
        sku: payload.base.sku ?? null,
        price: String(payload.base.price),
        compareAtPrice:
          payload.base.compareAtPrice == null
            ? null
            : String(payload.base.compareAtPrice),
        stockQuantity: payload.base.stockQuantity,
        weight: payload.base.weight ?? null,
        details: payload.base.description,
        metadata: payload.base.metadataRows,
        images: baseImages.length ? baseImages : (oldBase?.images ?? []),
        position: 0,
        enabled: true,
      },
      ...colorVariants,
      ...(payload.size?.dataset ?? []).map((item, index) => ({
        id: item.id,
        kind: "size" as const,
        title: item.sizeName,
        code: item.sizeCode ?? null,
        optionName: null,
        sku: item.sku ?? null,
        price: String(item.price),
        compareAtPrice:
          item.compareAtPrice == null ? null : String(item.compareAtPrice),
        stockQuantity: item.stockQuantity,
        weight: item.weight ?? null,
        details: item.details ?? null,
        metadata: item.metadataRows,
        images: existingById.get(item.id)?.images ?? [],
        position: index + 1,
        enabled: payload.size?.enabled ?? false,
      })),
      ...customVariants,
    ];

    const variantIds = variants.map((variant) => variant.id);
    await db.transaction(async (tx) => {
      await tx.delete(productEmbed).where(eq(productEmbed.productId, id));
      await tx.delete(productVariant).where(eq(productVariant.groupId, id));
      await tx
        .update(product)
        .set({
          slug: payload.slug,
          categoryId: payload.category,
          status: payload.status,
          variantIds,
        })
        .where(eq(product.id, id));
      await tx
        .insert(productVariant)
        .values(variants.map((variant) => ({ ...variant, groupId: id })));
    });

    return CreateResponse({
      message: "Product updated successfully",
      ok: true,
      status: 200,
    });
  } catch (error) {
    await cleanupFiles(uploadedPaths);
    console.error("Error updating product:", error);
    return CreateResponse({
      message:
        error instanceof Error ? error.message : "Failed to update product",
      status: 500,
    });
  }
}
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const session = await auth.api.getSession(request);

  if (!session?.session) {
    return CreateResponse({
      message: "Unauthorized",
      status: 401,
    });
  }

  if (!id) {
    return CreateResponse({
      message: "Missing product ID",
      status: 400,
    });
  }

  try {
    const productData = await db
      .select()
      .from(product)
      .where(eq(product.id, id))
      .limit(1);

    if (!productData || productData.length === 0) {
      return CreateResponse({
        message: "Product not found",
        status: 404,
      });
    }

    await db.delete(product).where(eq(product.id, id));
  } catch (error) {
    console.error("Error deleting product:", error);
    return CreateResponse({
      message: "Failed to delete product",
      status: 500,
    });
  }

  return CreateResponse({
    message: "Product deleted successfully",
    status: 200,
    ok: true,
  });
}
