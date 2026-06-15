import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {product, wishlist} from "@/db/schema"
import { eq ,and} from "drizzle-orm";

export async function POST(request: Request) {

    const user = await auth.api.getSession({
        headers: request.headers,
    });

    if(!user?.session?.userId) {
        return new Response(
            JSON.stringify({
                message: "Unauthorized"
            }),
            {
                status: 401
            }
        );
    }

    const {productSlug} = await request.json();

    if (!productSlug) {
        return new Response(
            JSON.stringify({
                message: "Product slug is required"
            }),
            {
                status: 400
            }
        );
    }

    const productData = await db.select().from(product).where(eq(product.slug, productSlug)).limit(1);

    if (productData.length === 0) {
        return new Response(
            JSON.stringify({
                message: "Product not found"
            }),
            {
                status: 404
            }
        );
    }


    const existingWish = await db.select().from(wishlist).where(and(eq(wishlist.userId, user.session.userId), eq(wishlist.productId, productData[0].id))).limit(1);

    return new Response(
        JSON.stringify({
            message: "Product found",
            product: productData[0],
            userId: user.session.userId
        }),
        {
            status: 200
        }
    );
}