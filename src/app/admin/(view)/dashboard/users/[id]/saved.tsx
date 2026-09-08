"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { InboxIcon } from "@animateicons/react/lucide";
import Image from "next/image";
import Link from "next/link";

const FALLBACK_IMAGE = "/img/prod1.jpg";

function getImageSource(image: string | null | undefined) {
  const value = image?.trim();
  if (!value) return FALLBACK_IMAGE;
  if (value.startsWith("/") || /^https?:\/\//i.test(value)) return value;
  return FALLBACK_IMAGE;
}

export default function Saved({
  data,
}: {
  data: {
    wishlist: {
      id: string;
      productId: string;
      userId: string;
      createdAt: string;
    };
    product: {
      id: string;
      slug: string;
      categoryId: string;
      status: string;
      variantIds: string[];
      createdAt: string;
      updatedAt: string;
    };
    product_variant: {
      id: string;
      groupId: string;
      code: string | null;
      sku: string;
      price: string;
      compareAtPrice: number | null;
      stockQuantity: number;
      weight: string;
      details: string;
      metadata: {
        id: string;
        name: string;
        description: string;
      }[];
      position: number;
      kind: string;
      enabled: boolean;
      title: string;
      optionName: string | null;
      images: string[];
      createdAt: string;
      bodySearch: string;
      updatedAt: string;
    };
  }[];
}) {
  return (
    <>
      <h2 className="text-xl font-semibold">My Wishlist</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 w-full mt-8">
        {data &&
          data?.length > 0 &&
          data?.map((item) => (
            <Link
              href={`/product/${item.product?.slug}`}
              key={item.product?.id}
            >
              <Card className="p-0! aspect-square flex flex-col transition-transform relative rounded-none shadow-none border-dashed overflow-visible">
                <CardHeader className="w-full aspect-video rounded-none relative">
                  <Image
                    src={getImageSource(item.product_variant?.images?.[0])}
                    alt={item.product_variant?.title || "Saved product"}
                    fill
                    className="object-cover"
                  />
                </CardHeader>
                <CardContent>
                  <h4 className="text-base font-bold">
                    {item.product_variant?.title}
                  </h4>
                  <p className="line-clamp-2">
                    {item.product_variant?.details}
                  </p>
                </CardContent>
                <CardFooter className="flex-1 w-full flex justify-start items-center pb-6 gap-2">
                  <p className="text-lg font-semibold">
                    {item.product_variant?.price}/-
                  </p>
                  <p className="text-destructive opacity-70 line-through">
                    {item.product_variant?.compareAtPrice}/-
                  </p>
                </CardFooter>
              </Card>
            </Link>
          ))}
        {data?.length === 0 && (
          <Empty className="md:grid-cols-2 lg:col-span-4 border border-border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <InboxIcon />
              </EmptyMedia>
              <EmptyTitle>No items in wishlist</EmptyTitle>
              <EmptyDescription>Your wishlist is empty</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild>
                <Link href="/products?preference=best_selling">
                  Explore Bestsellers
                </Link>
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </div>
    </>
  );
}
