import { CreateResponse } from "@/lib/backend/message";
import { createSupabaseStorageClient } from "@/lib/storage/supabase";

export async function GET() {
    const storage = createSupabaseStorageClient().storage

    CreateResponse({
        message:"Banner Retrieved Successfully",
        additionalData:{
            data: await storage.from("banners").list()
        }
    })
}

export async function POST(req:Request) {
    const storage = createSupabaseStorageClient().storage
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;
    const { data, error } = await storage.from("banners").upload(type, file);
    if(error) {
        return new Response(JSON.stringify({
            message:"Failed to upload banner",
            error
        }),{status:500})
    }
    CreateResponse({
        message:"Banner Uploaded Successfully",
        additionalData:{
            data
        }
    })
}