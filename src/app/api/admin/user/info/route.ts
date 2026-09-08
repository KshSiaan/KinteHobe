import { auth } from "@/lib/auth";
import {
  followRelation,
  order,
  orderItem,
  product,
  productVariant,
  user,
  wishlist,
} from "@/db/schema";
import { CreateResponse } from "@/lib/backend/message";
import { db } from "@/lib/db";
import { createSupabaseStorageClient } from "@/lib/storage/supabase";
import { and, count, desc, eq } from "drizzle-orm";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (session?.user?.role !== "admin") {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return CreateResponse({
      message: "User ID is required",
      ok: false,
      status: 400,
    });
  }

  try {
    const userData = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        role: user.role,
        banned: user.banned,
        banReason: user.banReason,
        banExpires: user.banExpires,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .where(eq(user.id, id))
      .limit(1);

    if (userData.length === 0) {
      return CreateResponse({
        message: "User not found",
        ok: false,
        status: 404,
      });
    }

    const [followerCount, followingCount, wishlistData, recentOrders] =
      await Promise.all([
        db
          .select({
            total: count(),
          })
          .from(followRelation)
          .where(
            and(
              eq(followRelation.followingId, id),
              eq(followRelation.status, "accepted"),
            ),
          ),
        db
          .select({ total: count() })
          .from(followRelation)
          .where(
            and(
              eq(followRelation.followerId, id),
              eq(followRelation.status, "accepted"),
            ),
          ),
        db
          .select()
          .from(wishlist)
          .where(eq(wishlist.userId, id))
          .innerJoin(product, eq(wishlist.productId, product.id))
          .innerJoin(
            productVariant,
            and(
              eq(productVariant.groupId, product.id),
              eq(productVariant.kind, "base"),
            ),
          ),
        db
          .select()
          .from(order)
          .where(eq(order.userId, id))
          .orderBy(desc(order.createdAt))
          .limit(10),
      ]);

    const recentOrdersData = await Promise.all(
      recentOrders.map(async (currentOrder) => {
        const items = await db
          .select()
          .from(orderItem)
          .where(eq(orderItem.orderId, currentOrder.id));

        return { ...currentOrder, items };
      }),
    );

    const storage = createSupabaseStorageClient();
    const normalizedWishlist = wishlistData.map((item) => ({
      ...item,
      product_variant: {
        ...item.product_variant,
        images: item.product_variant.images.map((imagePath) => {
          if (!imagePath) return imagePath;
          if (/^https?:\/\//i.test(imagePath)) return imagePath;
          return storage.storage.from("product").getPublicUrl(imagePath).data
            .publicUrl;
        }),
      },
    }));

    return CreateResponse({
      message: "User info fetched successfully",
      ok: true,
      status: 200,
      additionalData: {
        user: userData[0],
        counts: {
          followers: Number(followerCount[0]?.total ?? 0),
          following: Number(followingCount[0]?.total ?? 0),
          wishlist: normalizedWishlist.length,
          orders: recentOrders.length,
        },
        wishlist: normalizedWishlist,
        recentOrders: recentOrdersData,
      },
    });
  } catch (error) {
    return CreateResponse({
      message: "Failed to fetch user info",
      ok: false,
      status: 500,
      additionalData: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
  }
}
