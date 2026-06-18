import { product, wishlist,productVariant } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createSupabaseStorageClient } from "@/lib/storage/supabase";
import { and, eq } from "drizzle-orm";

function toProductPublicUrl(path: string) {
  return createSupabaseStorageClient().storage.from("product").getPublicUrl(path).data
    .publicUrl;
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

    const wishedProducts = await db.select().from(wishlist).where(eq(wishlist.userId, user.session.userId)).innerJoin(product, eq(wishlist.productId, product.id)).innerJoin(
        productVariant,
        and(eq(productVariant.groupId, product.id), eq(productVariant.kind, "base"))
    );

    return new Response(
        JSON.stringify({
            products: wishedProducts.map(wish => ({ ...wish.product, base: { ...wish.product_variant ,image:toProductPublicUrl(wish.product_variant.images[0]) } })),
        }),
        {
            status: 200
        }
    );
}