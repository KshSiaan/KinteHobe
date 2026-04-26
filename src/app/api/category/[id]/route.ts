import { category } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
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
    return Response.json(
        {
            message: "Category retrieved successfully",
            data: existingCategory,
        },
        { status: 200 },
    );

}