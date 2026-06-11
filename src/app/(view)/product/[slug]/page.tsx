import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { CheckIcon, TruckIcon } from "lucide-react";
import Controller from "./controller";

async function getProduct(slug: string) {
  "use cache";

  // 1. Skip fetch during build if it's the build-time 'dummy' slug
  if (slug === "build-time-dummy") return null;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/product/${slug}`,
      {
        next: { revalidate: 300 },
      },
    );

    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    return null;
  }
}

// 2. Return at least one result to satisfy 'Cache Components' validation
export async function generateStaticParams() {
  return [{ slug: "build-time-dummy" }];
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
  if (!data) {
    return <>lol</>;
  }
  return (
    <main className="p-4">
      <div className="grid grid-cols-4 gap-4 min-h-screen">
        <Suspense fallback={<div>Loading product...</div>}>
          <Product data={data.data ?? null} />
        </Suspense>
        <Suspense fallback={<div>Loading controller...</div>}>
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
      <Card className="mt-4">
        <CardContent className="flex justify-between items-center">
          <Avatar className="size-12">
            <AvatarImage
              className="rounded-none"
              src={data?.data?.category?.image}
            />
          </Avatar>
        </CardContent>
      </Card>
    </main>
  );
}
