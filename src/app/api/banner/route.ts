import { CreateResponse } from "@/lib/backend/message";
import { createSupabaseStorageClient } from "@/lib/storage/supabase";

export async function GET() {
  try {
    const storage = createSupabaseStorageClient();

    // 📦 get file metadata (this is the important part)
    const { data: files, error } = await storage.storage
      .from("banners")
      .list("", {
        search: "hero",
      });

    if (error || !files || files.length === 0) {
      throw new Error("Banner not found");
    }

    const file = files[0];

    const publicUrl = storage.storage
      .from("banners")
      .getPublicUrl("hero").data.publicUrl;

    // 🧠 use updated_at as version for cache busting
    const version = file.updated_at || file.created_at;
    const url = `${publicUrl}?v=${version}`;

    return CreateResponse({
      message: "Banner Retrieved Successfully",
      ok: true,
      status: 200,
      additionalData: {
        data: url,
      },
    });
  } catch (error) {
    return CreateResponse({
      message: "Failed to retrieve banner",
      ok: false,
      status: 500,
      additionalData: {
        error,
      },
    });
  }
}