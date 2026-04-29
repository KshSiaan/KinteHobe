import { CreateResponse } from "@/lib/backend/message";
import { createSupabaseStorageClient } from "@/lib/storage/supabase";

export async function GET() {
  const storage = createSupabaseStorageClient().storage;
  CreateResponse({
    message: "Banner Retrieved Successfully",
    additionalData: {
      data: storage.from("banners").getPublicUrl("main").data.publicUrl,
    },
  });
}
