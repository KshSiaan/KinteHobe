import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import product from "./product";
import Image from "next/image";
import Link from "next/link";
export default async function Related({ slug }: { slug: string }) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/client/related?slug=${slug}`,
    {
      next: { revalidate: 300 },
    },
  );
  const data: {
    message: string;
    ok: boolean;
    similarProducts: Array<{
      id: string;
      productId: string;
      similarity: number;
      product: {
        id: string;
        slug: string;
        categoryId: string;
        status: string;
        base: {
          id: string;
          groupId: string;
          image: Array<string>;
          title: string;
          details: string;
          price: string;
          compareAtPrice?: string;
          publicImages: Array<string>;
        };
      };
    }>;
  } = await res.json();
  return (
    <div className="w-full">
      <h3 className="text-lg">Related Products</h3>
      <Carousel className="grid mt-4">
        <CarouselContent className="py-2">
          {data?.similarProducts?.map((item) => (
            <CarouselItem key={item.id} className="basis-1/5">
              <Card
                key={item.product.base.id}
                className="p-0! flex flex-col transition-transform relative rounded-none shadow-none border-dashed overflow-visible"
              >
                <CardHeader className="w-full aspect-video rounded-none relative">
                  {item.product.base.compareAtPrice &&
                    item.product.base.price !==
                      item.product.base.compareAtPrice && (
                      <Badge
                        className="absolute z-20 top-2 left-2 bg-background/40 text-primary backdrop-blur-sm border border-primary/20 py-3!"
                        variant={"outline"}
                      >
                        {item.product.base &&
                        item.product.base.compareAtPrice &&
                        item.product.base.compareAtPrice !==
                          item.product.base.price
                          ? `${Math.round(
                              ((parseFloat(item.product.base.compareAtPrice) -
                                parseFloat(item.product.base.price)) /
                                parseFloat(item.product.base.compareAtPrice)) *
                                100,
                            )}%`
                          : null}{" "}
                        off
                      </Badge>
                    )}
                  <Link
                    href={`/product/${item.product.slug}`}
                    key={item.product.id}
                  >
                    <Image
                      src={
                        item.product.base.publicImages[0] ||
                        "https://placehold.co/400"
                      }
                      alt={item.product.slug}
                      fill
                      className="object-cover"
                    />
                  </Link>
                </CardHeader>
                {/* {item.product.base.publicImages[0]} */}

                <CardContent>
                  <Link
                    href={`/product/${item.product.slug}`}
                    key={item.product.id}
                    className="h-full"
                  >
                    <h4 className="text-base font-bold">
                      {item.product.base.title || "Product Title"}
                    </h4>
                    <p className="line-clamp-2">
                      {item.product.base.details ?? "Description not available"}
                    </p>
                  </Link>
                </CardContent>
                <CardFooter className="flex-1 w-full flex justify-start items-center pb-6 gap-2">
                  <p className="text-lg font-semibold">
                    {item.product.base
                      ? `₹${item.product.base.price}`
                      : "Price not available"}
                  </p>
                  <p className="text-destructive opacity-70 line-through">
                    {item.product.base &&
                    item.product.base.compareAtPrice &&
                    item.product.base.compareAtPrice !== item.product.base.price
                      ? `₹${item.product.base.compareAtPrice}`
                      : ""}
                  </p>
                </CardFooter>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex justify-center mt-4 h-12 w-full">
          <div className="relative">
            <CarouselPrevious />
          </div>
          <div className="relative">
            <CarouselNext />
          </div>
        </div>
      </Carousel>
    </div>
  );
}
