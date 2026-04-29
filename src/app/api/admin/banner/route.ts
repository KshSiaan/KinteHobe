import { CreateResponse } from "@/lib/backend/message";
import { createSupabaseStorageClient } from "@/lib/storage/supabase";

export async function POST(req: Request) {
    const storage = createSupabaseStorageClient().storage;
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
        return CreateResponse({
            message: "File is required",
            ok: false,
            status: 400,
        });
    }

    const { data, error } = await storage
        .from("banners")
        .upload("hero", file, { upsert: true });

    if (error) {
        return CreateResponse({
            message: "Failed to upload banner",
            ok: false,
            status: 500,
            additionalData: {
                error,
            },
        });
    }

    return CreateResponse({
        message: "Banner Uploaded Successfully",
        ok: true,
        status: 200,
        additionalData: {
            data,
        },
    });
}