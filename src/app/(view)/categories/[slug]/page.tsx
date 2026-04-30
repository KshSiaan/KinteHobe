import type { CreateResponseType } from "@/lib/backend/message";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Metadata } from "next";
import ProductSet from "@/components/core/base/product-set";

async function getCategory(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/client/category/${slug}`,
    {
      next: { revalidate: 60 * 5 }, // cache for 5 mins
    },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch category");
  }

  return res.json();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const data: CreateResponseType<{
    data: {
      metaTitle: string;
      metaDescription: string;
      name: string;
      description: string;
    };
  }> = await getCategory(slug);

  return {
    title: data?.data?.metaTitle || data?.data?.name || "Category",
    description: data?.data?.metaDescription || data?.data?.description || "",
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
      products: Array<{
        id: string;
        slug: string;
        categoryId: string;
        status: string;
        variantIds: Array<string>;
        createdAt: string;
        updatedAt: string;
        title: string;
        description: string;
        variants: Array<{
          id: string;
          groupId: string;
          code?: string;
          sku: string;
          price: string;
          compareAtPrice: string;
          stockQuantity: number;
          weight: string;
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
          publicImages: Array<string>;
        }>;
      }>;
    };
  }> = await getCategory(slug);

  return (
    <main className="mb-24">
      <header className="h-[40dvh] w-full relative mb-24">
        <Image
          src={data?.data?.banner ?? `https://placehold.co/1400x400`}
          alt={data?.data?.name ?? "Category Banner"}
          fill
          objectPosition="absolute"
          sizes="300"
          className="object-cover"
        />
        <Avatar className="size-48 absolute flex justify-center items-center -bottom-24 left-1/2 bg-background -translate-x-1/2">
          <AvatarImage
            src={data?.data?.image}
            className="rounded-none w-2/3 object-contain"
          />
          <AvatarFallback>
            {data?.data?.name?.charAt(0)?.toUpperCase() ?? "C"}
          </AvatarFallback>
        </Avatar>
      </header>

      <section className="pt-12 space-y-6 w-2/3 mx-auto">
        <h1 className="text-center text-3xl font-bold">{data?.data?.name}</h1>
        <p className="text-center text-muted-foreground">
          {data?.data?.description}
        </p>
      </section>
      <section className="mt-24">
        <ProductSet products={data?.data?.products} />
      </section>
    </main>
  );
}
