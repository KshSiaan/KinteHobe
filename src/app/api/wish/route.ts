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
    if (existingWish.length === 0) {
        await db.insert(wishlist).values({
            id: crypto.randomUUID(),
            userId: user.session.userId,
            productId: productData[0].id
        });
    }else{
        await db.delete(wishlist).where(eq(wishlist.id, existingWish[0].id));
    }

    return new Response(
        JSON.stringify({
            message: existingWish.length > 0 ? "Product removed from wishlist" : "Product added to wishlist",
            product: productData[0],
        }),
        {
            status: 200
        }
    );
}

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const productSlug = searchParams.get("productSlug");
    
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
            wished: existingWish.length > 0,
            product: productData[0],
        }),
        {
            status: 200
        }
    );

}

