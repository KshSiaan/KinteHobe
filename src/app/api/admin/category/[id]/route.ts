import { category } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSupabaseStorageClient } from "@/lib/storage/supabase";
import { eq } from "drizzle-orm";
import sharp from "sharp";
import { z } from "zod";

const categoryFormSchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().min(2),
  description: z.string().trim().min(10),
  isActive: z.enum(["true", "false"]).transform((value) => value === "true"),
  metaTitle: z.string().trim().min(10),
  metaDescription: z.string().trim().min(50),
});

const ICON_MAX_BYTES = 500 * 1024;
const BANNER_MAX_BYTES = 2 * 1024 * 1024;

async function optimizeImage(
    file: File,
    options: { maxBytes: number; maxWidth: number; maxHeight: number },
) {
    const input = Buffer.from(await file.arrayBuffer());
    const output = await sharp(input)
        .rotate()
        .resize({
            width: options.maxWidth,
            height: options.maxHeight,
            fit: "inside",
            withoutEnlargement: true,
        })
        .webp({ quality: 82, effort: 6 })
        .toBuffer();

    if (output.length <= options.maxBytes) {
        return output;
    }

    for (let quality = 72; quality >= 35; quality -= 7) {
        const candidate = await sharp(input)
            .rotate()
            .resize({
                width: options.maxWidth,
                height: options.maxHeight,
                fit: "inside",
                withoutEnlargement: true,
            })
            .webp({ quality, effort: 6 })
            .toBuffer();

        if (candidate.length <= options.maxBytes) {
            return candidate;
        }
    }

    throw new Error(
        `Unable to optimize ${file.name} under ${Math.round(options.maxBytes / 1024)}KB`,
    );
}

async function uploadOptimizedImage(
    file: File,
    path: string,
    options: { maxBytes: number; maxWidth: number; maxHeight: number },
) {
    const optimizedBuffer = await optimizeImage(file, options);

    const { data, error } = await getSupabaseStorageClient().storage
        .from("category")
        .upload(path, optimizedBuffer, {
            contentType: "image/webp",
            upsert: true,
        });

    return { data, error };
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const hasPermission = await auth.api.userHasPermission({
        headers: request.headers,
        body: {
            permissions: {
                category: ["update"],
            },
        },
    });

    if (!hasPermission?.success) {
        return Response.json(
            {
                message: "Forbidden",
            },
            { status: 403 },
        );
    }

    const { id } = await params;

    const [existingCategory] = await db
        .select()
        .from(category)
        .where(eq(category.id, id));

    if (!existingCategory) {
        return Response.json(
            {
                message: "Category not found",
            },
            { status: 404 },
        );
    }

    const formData = await request.formData();

    const rawValues = {
        name: formData.get("name"),
        slug: formData.get("slug"),
        description: formData.get("description"),
        isActive: formData.get("isActive"),
        metaTitle: formData.get("metaTitle"),
        metaDescription: formData.get("metaDescription"),
    };

    const parsed = categoryFormSchema.safeParse({
        name: rawValues.name,
        slug: rawValues.slug,
        description: rawValues.description,
        isActive: rawValues.isActive,
        metaTitle: rawValues.metaTitle,
        metaDescription: rawValues.metaDescription,
    });

    if (!parsed.success) {
const { fieldErrors: issues } = z.flattenError(parsed.error);
        return Response.json(
            {
                message: "Validation failed",
                issues,
            },
            { status: 400 },
        );
    }

    const image = formData.get("image");
    const banner = formData.get("banner");
    const removeIcon = formData.get("removeIcon") === "true";
    const removeBanner = formData.get("removeBanner") === "true";

    let iconPath = existingCategory.image;
    let bannerPath = existingCategory.banner;

    // Handle icon removal
    if (removeIcon) {
        if (iconPath) {
            await getSupabaseStorageClient().storage
                .from("category")
                .remove([iconPath]);
        }
        iconPath = null;
    }

    // Handle banner removal
    if (removeBanner) {
        if (bannerPath) {
            await getSupabaseStorageClient().storage
                .from("category")
                .remove([bannerPath]);
        }
        bannerPath = null;
    }

    // Handle optional image upload
    if (image instanceof File) {
        try {
            const newIconPath = `icon/${Date.now()}_${image.name.replace(/\.[^.]+$/, "")}.webp`;
            const { error: iconError } = await uploadOptimizedImage(image, newIconPath, {
                maxBytes: ICON_MAX_BYTES,
                maxWidth: 512,
                maxHeight: 512,
            });

            if (iconError) {
                return Response.json(
                    {
                        message: "Failed to upload icon",
                        error: iconError,
                    },
                    { status: 500 },
                );
            }

            // Delete old icon if it exists
            if (existingCategory.image) {
                await getSupabaseStorageClient().storage
                    .from("category")
                    .remove([existingCategory.image]);
            }

            iconPath = newIconPath;
        } catch (error) {
            return Response.json(
                {
                    message: error instanceof Error ? error.message : "Failed to process icon",
                },
                { status: 500 },
            );
        }
    }

    // Handle optional banner upload
    if (banner instanceof File) {
        try {
            const newBannerPath = `banner/${Date.now()}_${banner.name.replace(/\.[^.]+$/, "")}.webp`;
            const { error: bannerError } = await uploadOptimizedImage(banner, newBannerPath, {
                maxBytes: BANNER_MAX_BYTES,
                maxWidth: 1920,
                maxHeight: 1080,
            });

            if (bannerError) {
                return Response.json(
                    {
                        message: "Failed to upload banner",
                        error: bannerError,
                    },
                    { status: 500 },
                );
            }

            // Delete old banner if it exists
            if (existingCategory.banner) {
                await getSupabaseStorageClient().storage
                    .from("category")
                    .remove([existingCategory.banner]);
            }

            bannerPath = newBannerPath;
        } catch (error) {
            return Response.json(
                {
                    message: error instanceof Error ? error.message : "Failed to process banner",
                },
                { status: 500 },
            );
        }
    }

    const data = await db
        .update(category)
        .set({
            name: parsed.data.name,
            slug: parsed.data.slug,
            description: parsed.data.description,
            isActive: parsed.data.isActive,
            metaTitle: parsed.data.metaTitle,
            metaDescription: parsed.data.metaDescription,
            image: iconPath,
            banner: bannerPath,
            updatedAt: new Date(),
        })
        .where(eq(category.id, id))
        .returning();

    if (!data || data.length === 0) {
        return Response.json(
            {
                message: "Failed to update category",
            },
            { status: 500 },
        );
    }

    return Response.json(
        {
            message: "Category updated successfully",
            data: data[0],
        },
        { status: 200 },
    );
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {

    const hasPermission = await auth.api.userHasPermission({
        headers: _request.headers,
        body:{
            permissions:{
                category:["delete"]
            }
        }
    })

    if (!hasPermission?.success) {
        return Response.json(
            {
                message: "Forbidden",
            },
            { status: 403 },
        );
    }


    const { id } = await params;

    const [existingCategory] = await db
        .select({ image: category.image, banner: category.banner })
        .from(category)
        .where(eq(category.id, id));

    if (!existingCategory) {
        return Response.json(
            {
                message: "Category not found",
            },
            { status: 404 },
        );
    }

    await db.delete(category).where(eq(category.id, id));

    const cleanupPaths = [existingCategory.image, existingCategory.banner].filter(
        (path): path is string => Boolean(path),
    );

    if (cleanupPaths.length > 0) {
        await getSupabaseStorageClient().storage.from("category").remove(cleanupPaths);
    }

    return Response.json(
        {
            message: "Category deleted successfully",
        },
        { status: 200 },
    );
}