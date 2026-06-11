"use server";

import { auth } from "@/lib/auth";
import { getSupabaseStorageClient } from "@/lib/storage/supabase";
import sharp from "sharp";
import { headers } from "next/headers";

export async function uploadAvatar(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { error: "Unauthorized" };

  const file = formData.get("avatar") as File | null;
  if (!file) return { error: "No file provided" };

  const buffer = Buffer.from(await file.arrayBuffer());

  const optimized = await sharp(buffer)
    .resize(256, 256, { fit: "cover", position: "centre" })
    .webp({ quality: 85 })
    .toBuffer();

  const supabase = getSupabaseStorageClient();
  const path = `${session.user.id}.webp`;

  const { error: uploadError } = await supabase.storage
    .from("avatar")
    .upload(path, optimized, {
      contentType: "image/webp",
      upsert: true,
    });

  if (uploadError) return { error: uploadError.message };

  const { data } = supabase.storage.from("avatar").getPublicUrl(path);

  return { url: `${data.publicUrl}?t=${Date.now()}` };
}
