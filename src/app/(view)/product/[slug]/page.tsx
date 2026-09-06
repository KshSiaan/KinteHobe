import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { CreateResponseType } from "@/lib/backend/message";
import { Metadata } from "next";
import Image from "next/image";
import React, { Suspense } from "react";
import Product from "./product";
import { Separator } from "@/components/ui/separator";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import Controller from "./controller";
import Loading from "@/app/loading";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import Link from "next/link";

async function getProduct(slug: string) {
  const headerzz = await headers();
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/product/${slug}`,
      {
        next: { revalidate: 300 },
        headers: headerzz,
      },
    );

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data: CreateResponseType<{
    data: {
      product: {
        id: string;
        slug: string;
        categoryId: string;
        status: string;
        variantIds: Array<string>;
        createdAt: string;
        updatedAt: string;
      };
      category: {
        id: string;
        parentId: any;
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
      };
      variants: Array<{
        id: string;
        groupId: string;
        code?: string;
        sku: string;
        price: string;
        compareAtPrice: string;
        stockQuantity: number;
        weight?: string;
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
      }>;
    };
  }> = await getProduct(slug);

  if (!data) return { title: "Product" };

  const base = data?.data?.variants.find((variant) => variant.kind === "base");

  return {
    title: `${base?.title} - KinteHobe` || "Product",
    description: base?.details || "",
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data: CreateResponseType<{
    data: {
      product: {
        id: string;
        slug: string;
        categoryId: string;
        status: string;
        variantIds: Array<string>;
        createdAt: string;
        updatedAt: string;
      };
      category: {
        id: string;
        parentId: any;
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
      };
      variants: Array<{
        id: string;
        groupId: string;
        code?: string;
        sku: string;
        price: string;
        compareAtPrice: string;
        stockQuantity: number;
        weight?: string;
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
      }>;
    };
  }> = await getProduct(slug);

  if (!data) return { title: "Product" };

  return (
    <main className="p-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-screen">
        <Suspense
          fallback={
            <div className="h-full! w-full flex justify-center items-center">
              <Loading />
            </div>
          }
        >
          <Product data={data.data ?? null} />
        </Suspense>
        <Suspense
          fallback={
            <div className="h-full! w-full flex justify-center items-center">
              <Loading />
            </div>
          }
        >
          <Controller data={data.data ?? null} />
        </Suspense>
      </div>
      <Separator className="my-4" />
      <div className="w-full">
        <h3 className="text-lg">Related Products</h3>
        <Carousel className="grid mt-4">
          <CarouselContent className="py-2">
            <CarouselItem className="basis-1/5">
              <Card></Card>
            </CarouselItem>
            <CarouselItem className="basis-1/5">
              <Card></Card>
            </CarouselItem>
            <CarouselItem className="basis-1/5">
              <Card></Card>
            </CarouselItem>
            <CarouselItem className="basis-1/5">
              <Card></Card>
            </CarouselItem>
            <CarouselItem className="basis-1/5">
              <Card></Card>
            </CarouselItem>
            <CarouselItem className="basis-1/5">
              <Card></Card>
            </CarouselItem>
            <CarouselItem className="basis-1/5">
              <Card></Card>
            </CarouselItem>
            <CarouselItem className="basis-1/5">
              <Card></Card>
            </CarouselItem>
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
      <Card className="group relative overflow-hidden border bg-muted/30 shadow-none mt-24">
        <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border bg-background shadow-sm sm:h-32 sm:w-32">
            <Image
              src={data?.data?.category?.image}
              alt={data?.data?.category?.name || "Category Image"}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Explore the category
              </p>

              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                {data?.data?.category?.name || "Unknown Category"}
              </h2>
            </div>

            <CardDescription className="max-w-2xl text-sm leading-6">
              {data?.data?.category?.description ||
                "Discover more products from this category."}
            </CardDescription>

            <div>
              <Button variant="outline" className="mt-1" asChild>
                <Link href={`/categories/${data?.data?.category?.slug}`}>
                  See more products
                  <span className="ml-1 transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
