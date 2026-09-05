import { createSupabaseStorageClient } from "@/lib/storage/supabase";
import { recentProducts } from "./recent";
import { favouriteProducts } from "./favourite";
import { bestSellingProducts } from "./best";
export const storage = createSupabaseStorageClient();

export function toProductPublicUrl(path: string) {
  return storage.storage.from("product").getPublicUrl(path).data.publicUrl;
}

export function toCategoryPublicUrl(path: string | null | undefined) {
  if (!path) return null;
  return storage.storage.from("category").getPublicUrl(path).data.publicUrl;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const preference = url.searchParams.get("preference") ?? "recent";

  // ["best_selling", "most_favorites", "trending"];

  const rawLimit = Number(url.searchParams.get("limit") ?? 60);
  const limit = Math.min(
    Math.max(Number.isFinite(rawLimit) ? Math.floor(rawLimit) : 60, 1),
    100,
    w,
  );

  if (preference === "most_favorites") {
    const favourites = await favouriteProducts(limit);
    return Response.json(favourites, { status: favourites.code });
  }

  if (preference === "best_selling") {
    const bestSelling = await bestSellingProducts(limit);
    return Response.json(bestSelling, { status: bestSelling.code });
  }

  const recents = await recentProducts(limit);

  return Response.json(recents, { status: recents.code });
}
