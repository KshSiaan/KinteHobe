import { category } from "@/db/schema";
import { db } from "@/lib/db";
import { getSupabaseStorageClient } from "@/lib/storage/supabase";
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
            upsert: false,
        });

    return { data, error };
}

export async function POST(request: Request) {


    const hasPermission


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

    if (image && !(image instanceof File)) {
        return Response.json(
            {
                message: "Image must be a file",
            },
            { status: 400 },
        );
    }

    if (banner && !(banner instanceof File)) {
        return Response.json(
            {
                message: "Banner must be a file",
            },
            { status: 400 },
        );
    }

    if (!(image instanceof File)) {
        return Response.json(
            {
                message: "Image must be a file",
            },
            { status: 400 },
        );
    }

    if (!(banner instanceof File)) {
        return Response.json(
            {
                message: "Banner must be a file",
            },
            { status: 400 },
        );
    }

    const iconPath = `icon/${Date.now()}_${image.name.replace(/\.[^.]+$/, "")}.webp`;
    const bannerPath = `banner/${Date.now()}_${banner.name.replace(/\.[^.]+$/, "")}.webp`;

    const [{ data: createdIcon, error: iconError }, { data: createdBanner, error: bannerError }] = await Promise.all([
        uploadOptimizedImage(image, iconPath, {
            maxBytes: ICON_MAX_BYTES,
            maxWidth: 512,
            maxHeight: 512,
        }),
        uploadOptimizedImage(banner, bannerPath, {
            maxBytes: BANNER_MAX_BYTES,
            maxWidth: 1920,
            maxHeight: 1080,
        }),
    ]);

    if (iconError) {
        return Response.json(
            {
                message: "Failed to upload icon",
                error: iconError,
            },
            { status: 500 },
        );
    }

    if (bannerError) {
        return Response.json(
            {
                message: "Failed to upload banner",
                error: bannerError,
            },
            { status: 500 },
        );
    }

    const data = await db.insert(category).values({
        id: crypto.randomUUID(),
        name:parsed?.data?.name,
        slug:parsed?.data?.slug,
        description:parsed?.data?.description,
        isActive:parsed?.data?.isActive,
        metaTitle:parsed?.data?.metaTitle,
        metaDescription:parsed?.data?.metaDescription,
        image: createdIcon?.path,
        banner: createdBanner?.path,
        parentId: null,
    }).returning();

    if (!data || data.length === 0) {

        const {error} = await getSupabaseStorageClient().storage.from("category").remove([iconPath, bannerPath]);

        return Response.json(
            {
                message: error?.message || "Failed to create category, and cleanup failed",
            },
            { status: 500 },
        );
    }


    return Response.json(
        {
            message: "Category created successfully",
            data: data[0],
        },
        { status: 201 },
    );

}