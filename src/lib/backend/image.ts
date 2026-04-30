import { createSupabaseStorageClient } from "../storage/supabase";


export function getFullURL({ bucket, path }: { bucket: string; path: string }) {
    const supabase = createSupabaseStorageClient();
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
}