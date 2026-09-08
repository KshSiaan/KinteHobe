"use client";
import { Spinner } from "@/components/kibo-ui/spinner";
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
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";

export default function Saved() {
  const { data, isPending } = useQuery({
    queryKey: ["all_wish"],
    queryFn: async (): Promise<{
      products: Array<{
        id: string;
        slug: string;
        categoryId: string;
        status: string;
        variantIds: Array<string>;
        createdAt: string;
        updatedAt: string;
        base: {
          id: string;
          image: string;
          groupId: string;
          code: any;
          sku: string;
          price: string;
          compareAtPrice: string;
          stockQuantity: number;
          weight: any;
          details: string;
          metadata: Array<{
            id: string;
            name: string;
            description: string;
          }>;
          position: number;
          kind: string;
          enabled: boolean;
          title: string;
          optionName: any;
          images: Array<string>;
          createdAt: string;
          updatedAt: string;
        };
      }>;
    }> => {
      const res = await fetch("/api/wish/all");
      if (!res.ok) {
        throw new Error("Failed to fetch wishlist");
      }
      return res.json();
    },
  });
  if (isPending) {
    return (
      <div className="w-full h-[30dvh] flex justify-center items-center">
        <Spinner variant="ring" />
      </div>
    );
  }
  return (
    <>
      <h2 className="text-xl font-semibold">My Wishlist</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 w-full">
        {data?.products &&
          data?.products?.length > 0 &&
          data?.products?.map((product) => (
            <Link href={`/product/${product?.slug}`} key={product.id}>
              <Card className="p-0! aspect-square flex flex-col transition-transform relative rounded-none shadow-none border-dashed overflow-visible">
                <CardHeader className="w-full aspect-video rounded-none relative">
                  <Image
                    src={product.base.image}
                    alt={product.base.title}
                    fill
                    className="object-cover"
                  />
                </CardHeader>
                <CardContent>
                  <h4 className="text-base font-bold">{product.base.title}</h4>
                  <p className="line-clamp-2">{product.base.details}</p>
                </CardContent>
                <CardFooter className="flex-1 w-full flex justify-start items-center pb-6 gap-2">
                  <p className="text-lg font-semibold">
                    {product.base.price}/-
                  </p>
                  <p className="text-destructive opacity-70 line-through">
                    {product.base.compareAtPrice}/-
                  </p>
                </CardFooter>
              </Card>
            </Link>
          ))}
        {data?.products?.length === 0 && (
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
