import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import type { CreateResponseType } from "@/lib/backend/message";
import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import Product from "./product";
import { Separator } from "@/components/ui/separator";
import Controller from "./controller";
import Loading from "@/app/loading";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Related from "./related";

type ProductResponse = CreateResponseType<{
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
      parentId: string | null;
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
      optionName: string | null;
      images: Array<string>;
      createdAt: string;
      updatedAt: string;
    }>;
  };
}>;

type ProductLoadResult =
  | { data: ProductResponse; error: null }
  | { data: null; error: string };

async function getProduct(slug: string): Promise<ProductLoadResult> {
  try {
    const requestHeaders = await headers();
    const cookie = requestHeaders.get("cookie");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/product/${slug}`,
      {
        next: { revalidate: 300 },
        headers: cookie ? { cookie } : undefined,
      },
    );

    const body = (await res.json().catch(() => null)) as
      | (ProductResponse & { message?: string })
      | { message?: string }
      | null;

    if (!res.ok) {
      return {
        data: null,
        error:
          body && "message" in body && body.message
            ? body.message
            : `Product request failed with status ${res.status}`,
      };
    }

    if (!body || !("data" in body) || !body.data) {
      return {
        data: null,
        error: "The product response was empty or invalid.",
      };
    }

    return { data: body, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to load product",
    };
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProduct(slug);

  if (result.error) return { title: "Product error" };

  const data = result.data;

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
  const result = await getProduct(slug);

  if (result.error || !result.data) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center p-6">
        <Card className="w-full max-w-xl border-destructive/40">
          <CardHeader>
            <CardDescription>Product request failed</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="break-words font-mono text-sm text-destructive">
              {result.error}
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  const data = result.data;

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
      <Suspense
        fallback={
          <div className="h-full! w-full flex justify-center items-center">
            <Loading />
          </div>
        }
      >
        <Related slug={slug} />
      </Suspense>
      <Card className="group relative overflow-hidden border bg-muted/30 shadow-none mt-24">
        <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border bg-background shadow-sm sm:h-32 sm:w-32">
            <Image
              src={data.data.category.image || "https://placehold.co/256"}
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
