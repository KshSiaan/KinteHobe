import { category } from "@/db/schema";
import { auth } from "@/lib/auth";
import { CreateResponse } from "@/lib/backend/message";
import { db } from "@/lib/db";
import { createSupabaseStorageClient } from "@/lib/storage/supabase";

export async function GET() {
    try {
        const categories = await db.select().from(category);
        const sb = createSupabaseStorageClient();
        const data = categories.map((cat) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            image:sb.storage.from("category").getPublicUrl(cat.image!).data.publicUrl,
            banner:sb.storage.from("category").getPublicUrl(cat.banner!).data.publicUrl,
            description: cat.description,
            isActive: cat.isActive,
            metaTitle: cat.metaTitle,
            metaDescription: cat.metaDescription,
            createdAt: cat.createdAt,
            updatedAt: cat.updatedAt,
        }));
        return CreateResponse({ message: "Categories fetched successfully", ok: true, status: 200, additionalData:{data} });
    } catch (error) {
        return CreateResponse({ message: "Failed to fetch categories" , ok:false, status:500, additionalData:{error} });
    }
}