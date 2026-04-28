import { product, productVariant, category } from "../../../../db/schema";
import { db } from "../../../../lib/db";
import { getSupabaseStorageClient } from "../../../../lib/storage/supabase";
import {
  productCreatePayloadSchema,
  type ProductCreatePayload,
} from "../../../../lib/validations/product-create";
import { createSupabaseStorageClient } from "@/lib/storage/supabase";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

type ProductVariantInsert = typeof productVariant.$inferInsert;

function normalizeFileName(fileName: string) {
  const value = fileName.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]+/g, "-");
  return value.length > 0 ? value : "file";
}

function getFileExtension(fileName: string) {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex >= 0 ? fileName.slice(dotIndex) : "";
}

function getFilesFromFormData(values: FormDataEntryValue[], fieldName: string) {
  const files = values.filter((value): value is File => value instanceof File);

  if (files.length !== values.length) {
    throw new Error(`${fieldName} must contain files only`);
  }

  return files;
}

async function uploadFiles(files: File[], folder: string) {
  const storage = getSupabaseStorageClient().storage.from("product");
  const uploadedPaths: string[] = [];

  for (const [index, file] of files.entries()) {
    const path = `${folder}/${Date.now()}_${index}_${normalizeFileName(file.name)}${getFileExtension(file.name)}`;
    const { data, error } = await storage.upload(path, await file.arrayBuffer(), {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

    if (error || !data) {
      throw new Error(error?.message || `Failed to upload ${file.name}`);
    }

    uploadedPaths.push(data.path);
  }

  return uploadedPaths;
}

async function cleanupUploadedFiles(paths: string[]) {
  if (paths.length === 0) {
    return;
  }

  await getSupabaseStorageClient().storage.from("product").remove(paths);
}

function buildBaseVariant(
  payload: ProductCreatePayload,
  productId: string,
  baseRowId: string,
  baseImagePaths: string[],
): ProductVariantInsert {
  return {
    id: baseRowId,
    groupId: productId,
    kind: "base",
    enabled: true,
    title: payload.base.title,
    optionName: null,
    code: null,
    sku: payload.base.sku ?? null,
    price: String(payload.base.price),
    compareAtPrice:
      payload.base.compareAtPrice != null ? String(payload.base.compareAtPrice) : null,
    stockQuantity: payload.base.stockQuantity,
    weight: payload.base.weight ?? null,
    details: payload.base.description,
    metadata: payload.base.metadataRows,
    images: baseImagePaths,
    position: 0,
  };
}

function toProductPublicUrl(path: string) {
  return createSupabaseStorageClient().storage.from("product").getPublicUrl(path).data
    .publicUrl;
}

function toCategoryPublicUrl(path: string | null | undefined) {
  if (!path) return null;
  return createSupabaseStorageClient().storage.from("category").getPublicUrl(path).data
    .publicUrl;
}

export async function GET() {
  try {
    const rows = await db
      .select({
        product,
        category,
        variant: productVariant,
      })
      .from(product)
      .leftJoin(category, eq(product.categoryId, category.id))
      .leftJoin(productVariant, eq(product.id, productVariant.groupId))
      .orderBy(desc(product.createdAt), desc(productVariant.position));

    const productMap = new Map<
      string,
      {
        id: string;
        slug: string;
        category: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image: string | null;
          banner: string | null;
          isActive: boolean | null;
          metaTitle: string | null;
          metaDescription: string | null;
          createdAt: Date;
          updatedAt: Date;
        };
        categoryId: string;
        status: typeof product.$inferSelect.status;
        variantIds: string[];
        createdAt: Date;
        updatedAt: Date;
        variants: Array<
          typeof productVariant.$inferSelect & {
            publicImages: string[];
          }
        >;
      }
    >();

    for (const row of rows) {
      const currentProduct = row.product;
      const currentCategory = row.category;

      if (!currentCategory) {
        continue;
      }

      if (!productMap.has(currentProduct.id)) {
        productMap.set(currentProduct.id, {
          id: currentProduct.id,
          slug: currentProduct.slug,
          category: {
            id: currentCategory.id,
            name: currentCategory.name,
            slug: currentCategory.slug,
            description: currentCategory.description,
            image: toCategoryPublicUrl(currentCategory.image),
            banner: toCategoryPublicUrl(currentCategory.banner),
            isActive: currentCategory.isActive,
            metaTitle: currentCategory.metaTitle,
            metaDescription: currentCategory.metaDescription,
            createdAt: currentCategory.createdAt,
            updatedAt: currentCategory.updatedAt,
          },
          categoryId: currentProduct.categoryId,
          status: currentProduct.status,
          variantIds: currentProduct.variantIds,
          createdAt: currentProduct.createdAt,
          updatedAt: currentProduct.updatedAt,
          variants: [],
        });
      }

      if (row.variant) {
        const variant = row.variant;
        const productEntry = productMap.get(currentProduct.id);

        if (!productEntry) {
          continue;
        }

        productEntry.variants.push({
          ...variant,
          publicImages: variant.images.map((imagePath) => toProductPublicUrl(imagePath)),
        });
      }
    }

    return Response.json(
      {
        message: "Products fetched successfully",
        data: Array.from(productMap.values()),
      },
      { status: 200 },
    );
  } catch (error) {
    return Response.json(
      {
        message: error instanceof Error ? error.message : "Failed to fetch products",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const payloadRaw = formData.get("payload");

  if (typeof payloadRaw !== "string") {
    return Response.json({ message: "Payload must be a string" }, { status: 400 });
  }

  let payloadJson: unknown;

  try {
    payloadJson = JSON.parse(payloadRaw) as unknown;
  } catch {
    return Response.json({ message: "Payload must be valid JSON" }, { status: 400 });
  }

  const parsedPayload = productCreatePayloadSchema.safeParse(payloadJson);

  if (!parsedPayload.success) {
    return Response.json(
      {
        message: "Validation failed",
        issues: z.flattenError(parsedPayload.error).fieldErrors,
      },
      { status: 400 },
    );
  }

  const payload = parsedPayload.data;
  const baseFiles = getFilesFromFormData(formData.getAll("baseImages"), "baseImages");

  const expectedColorImages = (payload.color?.dataset ?? []).reduce(
    (count: number, variant: ProductCreatePayload["color"]["dataset"][number]) =>
      count + (variant.images?.length ?? 0),
    0,
  );

  const colorFiles = expectedColorImages > 0
    ? getFilesFromFormData(formData.getAll("colorImages"), "colorImages")
    : [];

  if (payload.base.images.length !== baseFiles.length) {
    return Response.json({ message: "Base image count mismatch" }, { status: 400 });
  }

  if (expectedColorImages !== colorFiles.length) {
    return Response.json({ message: "Color image count mismatch" }, { status: 400 });
  }

  const uploadedPaths: string[] = [];

  try {
    const productId = crypto.randomUUID();
    const variantIds: string[] = [];

    const baseImagePaths = await uploadFiles(baseFiles, `product/${productId}/base`);
    uploadedPaths.push(...baseImagePaths);

    let colorCursor = 0;
    const colorRows: ProductVariantInsert[] = [];

    const colorDataset = payload.color?.dataset ?? [];
    const colorEnabled = payload.color?.enabled ?? false;

    if (colorDataset.length > 0) {
      for (const variant of colorDataset) {
        const filesForVariant = colorFiles.slice(colorCursor, colorCursor + (variant.images?.length ?? 0));

        if (filesForVariant.length !== (variant.images?.length ?? 0)) {
          throw new Error("Color image count mismatch");
        }

        colorCursor += variant.images.length;

        const imagePaths = await uploadFiles(filesForVariant, `product/${productId}/color/${variant.id}`);
        uploadedPaths.push(...imagePaths);

        const rowId = crypto.randomUUID();
        variantIds.push(rowId);
        colorRows.push({
          id: rowId,
          groupId: productId,
          kind: "color",
          enabled: colorEnabled,
          title: variant.colorName,
          optionName: null,
          code: variant.colorValue,
          sku: variant.sku ?? null,
          price: String(variant.price),
          compareAtPrice:
            variant.compareAtPrice != null ? String(variant.compareAtPrice) : null,
          stockQuantity: variant.stockQuantity,
          weight: null,
          details: variant.details ?? null,
          metadata: variant.metadataRows,
          images: imagePaths,
          position: colorRows.length + 1,
        });
      }
    }

    const sizeDataset = payload.size?.dataset ?? [];
    const sizeEnabled = payload.size?.enabled ?? false;
    const sizeRows: ProductVariantInsert[] = sizeDataset.map((variant, index) => {
      const rowId = crypto.randomUUID();
      variantIds.push(rowId);

      return {
        id: rowId,
        groupId: productId,
        kind: "size",
        enabled: sizeEnabled,
        title: variant.sizeName,
        optionName: null,
        code: variant.sizeCode ?? null,
        sku: variant.sku ?? null,
        price: String(variant.price),
        compareAtPrice:
          variant.compareAtPrice != null ? String(variant.compareAtPrice) : null,
        stockQuantity: variant.stockQuantity,
        weight: variant.weight ?? null,
        details: variant.details ?? null,
        metadata: variant.metadataRows,
        images: [],
        position: colorRows.length + index + 1,
      };
    });

    const customDataset = payload.custom?.dataset ?? [];
    const customEnabled = payload.custom?.enabled ?? false;
    const customRows: ProductVariantInsert[] = customDataset.flatMap((group, groupIndex) =>
      group.options.map((variant, optionIndex) => {
        const rowId = crypto.randomUUID();
        variantIds.push(rowId);

        return {
          id: rowId,
          groupId: productId,
          kind: "custom",
          enabled: customEnabled,
          title: group.groupTitle,
          optionName: variant.optionName,
          code: variant.optionCode ?? null,
          sku: variant.sku ?? null,
          price: String(variant.price),
          compareAtPrice:
            variant.compareAtPrice != null ? String(variant.compareAtPrice) : null,
          stockQuantity: variant.stockQuantity,
          weight: variant.weight ?? null,
          details: variant.details ?? null,
          metadata: variant.metadataRows,
          images: [],
          position: colorRows.length + sizeRows.length + groupIndex + optionIndex + 1,
        };
      }),
    );

    const baseRowId = crypto.randomUUID();
    variantIds.unshift(baseRowId);

    const [createdProduct] = await db.transaction(async (tx) => {
      const [productRow] = await tx
        .insert(product)
        .values({
          id: productId,
          slug: payload.slug,
          categoryId: payload.category,
          status: payload.status,
          variantIds,
        })
        .returning();

      if (!productRow) {
        throw new Error("Failed to create product");
      }

      await tx.insert(productVariant).values([
        buildBaseVariant(payload, productId, baseRowId, baseImagePaths),
        ...colorRows,
        ...sizeRows,
        ...customRows,
      ]);

      return [productRow] as const;
    });

    return Response.json(
      {
        message: "Product created successfully",
        data: createdProduct,
      },
      { status: 201 },
    );
  } catch (error) {
    await cleanupUploadedFiles(uploadedPaths);

    return Response.json(
      {
        message: error instanceof Error ? error.message : "Failed to create product",
      },
      { status: 500 },
    );
  }
}


