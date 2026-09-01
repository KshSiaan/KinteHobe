"use client";

import { Spinner } from "@/components/kibo-ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CreateResponseType } from "@/lib/backend/message";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type ProductVariant = {
  id: string;
  groupId: string;
  code?: string | null;
  sku: string;
  price?: string | null;
  compareAtPrice?: string | null;
  stockQuantity: number;
  weight?: string | null;
  details: string;
  metadata?: Array<{
    id: string;
    name: string;
    description: string;
  }> | null;
  position: number;
  kind: string;
  enabled: boolean;
  title: string;
  optionName: any;
  images?: Array<string> | null;
  createdAt: string;
  updatedAt: string;
  publicImages?: Array<string> | null;
};

type Product = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    banner: string;
    isActive: boolean;
    metaTitle: string;
    metaDescription: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  categoryId: string;
  status: string;
  variantIds?: Array<string> | null;
  createdAt: string;
  updatedAt: string;
  variants?: ProductVariant[] | null;
};

export default function Page() {
  const searchParams = useSearchParams();

  const preference = searchParams.get("preference") || "trending";

  const { data, isPending, isError } = useQuery({
    queryKey: ["products", preference],

    queryFn: async (): Promise<
      CreateResponseType<{
        data: Product[];
      }>
    > => {
      const res = await fetch(
        `/api/product?preference=${encodeURIComponent(preference)}`,
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch products: ${res.status}`);
      }

      const response = await res.json();

      return response;
    },
  });

  const products = Array.isArray(data?.data) ? data.data : [];

  if (isPending) {
    return (
      <main className="container mx-auto flex min-h-[400px] items-center justify-center">
        <Spinner />
      </main>
    );
  }

  if (isError) {
    return (
      <main className="container mx-auto py-10">
        <div className="text-center text-destructive">
          Failed to load products.
        </div>
      </main>
    );
  }

  return (
    <main className="py-4">
      <div className="container mx-auto mb-6 flex items-center justify-between">
        <h1 className="my-4 text-2xl font-bold">Products</h1>

        <div className="flex gap-4">
          <Select>
            <SelectTrigger className="min-w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
          </Select>
        </div>
      </div>

      {products.length === 0 ? (
        <section className="container mx-auto py-20 text-center">
          <p className="text-muted-foreground">No products found.</p>
        </section>
      ) : (
        <section className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => {
            /*
             * Everything coming from the API is treated as potentially
             * incomplete. Never assume variants/images/prices exist.
             */

            const variants = Array.isArray(product?.variants)
              ? product.variants
              : [];

            const base = variants.find((variant) => variant?.kind === "base");

            const colorVariants = variants.filter(
              (variant) =>
                variant?.kind === "color" &&
                typeof variant?.code === "string" &&
                variant.code.trim().length > 0,
            );

            const sizeVariants = variants.filter(
              (variant) =>
                variant?.kind === "size" &&
                typeof variant?.code === "string" &&
                variant.code.trim().length > 0,
            );

            const colors = colorVariants
              .map((variant) => variant.code?.trim())
              .filter((color): color is string => Boolean(color));

            const sizes = sizeVariants
              .map((variant) => variant.code?.trim())
              .filter((size): size is string => Boolean(size));

            const images = Array.isArray(base?.publicImages)
              ? base.publicImages
              : [];

            const image =
              images.find(
                (src) => typeof src === "string" && src.trim().length > 0,
              ) || "https://placehold.co/400";

            const price = base?.price != null ? String(base.price) : null;

            const compareAtPrice =
              base?.compareAtPrice != null ? String(base.compareAtPrice) : null;

            const priceNumber = price ? Number.parseFloat(price) : NaN;
            const compareAtPriceNumber = compareAtPrice
              ? Number.parseFloat(compareAtPrice)
              : NaN;

            const hasDiscount =
              Number.isFinite(priceNumber) &&
              Number.isFinite(compareAtPriceNumber) &&
              compareAtPriceNumber > priceNumber;

            const discountPercentage = hasDiscount
              ? Math.round(
                  ((compareAtPriceNumber - priceNumber) /
                    compareAtPriceNumber) *
                    100,
                )
              : null;

            return (
              <Card
                key={product?.id ?? product?.slug}
                className="relative flex flex-col overflow-visible rounded-none border-dashed p-0! shadow-none transition-transform"
              >
                <CardHeader className="relative aspect-video w-full rounded-none">
                  {hasDiscount && discountPercentage !== null && (
                    <Badge
                      className="absolute left-2 top-2 z-20 border border-primary/20 bg-background/40 py-3! text-primary backdrop-blur-sm"
                      variant="outline"
                    >
                      {discountPercentage}% off
                    </Badge>
                  )}

                  <Link
                    href={`/product/${product?.slug ?? ""}`}
                    className="block h-full w-full"
                  >
                    <Image
                      src={image}
                      alt={product?.title || "Product"}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover"
                    />
                  </Link>
                </CardHeader>

                <CardContent>
                  <Link
                    href={`/product/${product?.slug ?? ""}`}
                    className="block h-full"
                  >
                    <h4 className="text-base font-bold">
                      {product?.title || "Untitled product"}
                    </h4>

                    <p className="line-clamp-2">
                      {product?.description || "Description not available"}
                    </p>
                  </Link>
                </CardContent>

                <CardFooter className="flex w-full flex-1 items-center justify-start gap-2 pb-6">
                  <p className="text-lg font-semibold">
                    {price ? `₹${price}` : "Price not available"}
                  </p>
                  {hasDiscount && compareAtPrice && (
                    <p className="text-destructive opacity-70 line-through">
                      ${compareAtPrice}
                    </p>
                  )}
                </CardFooter>

                <CardFooter className="grid w-full grid-cols-2 gap-2 pb-4">
                  <div className="font-semibold text-muted-foreground">
                    {sizes.join(", ")}
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    {colors.map((color, index) => (
                      <Button
                        key={`${color}-${
                          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                          index
                        }`}
                        type="button"
                        aria-label={`Color ${color}`}
                        className={cn(
                          "size-6! rounded-full! p-0! hover:ring-4 ring-zinc-500/20",
                        )}
                        style={{
                          backgroundColor: color,
                        }}
                      />
                    ))}
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </section>
      )}
    </main>
  );
}
