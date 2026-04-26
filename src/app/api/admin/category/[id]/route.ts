import { category } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSupabaseStorageClient } from "@/lib/storage/supabase";
import { eq } from "drizzle-orm";

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