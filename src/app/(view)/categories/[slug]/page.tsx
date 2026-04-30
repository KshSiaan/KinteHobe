import type { Metadata } from "next";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ProductSet from "@/components/core/base/product-set";
import type { CreateResponseType } from "@/lib/backend/message";

async function getCategory(slug: string) {
  "use cache";

  // 1. Skip fetch during build if it's the build-time 'dummy' slug
  if (slug === "build-time-dummy") return null;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/client/category/${slug}`,
      {
        next: { revalidate: 300 },
      },
    );

    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    // Silently fail during build so the process continues
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
  const data = await getCategory(slug);

  if (!data) return { title: "Category" };

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
  const data: CreateResponseType<any> = await getCategory(slug);

  // 3. Handle null or dummy data gracefully
  if (!data?.data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground italic">
          {slug === "build-time-dummy"
            ? "Build validation in progress..."
            : "Category not found."}
        </p>
      </div>
    );
  }

  return (
    <main className="mb-24">
      <header className="h-[40dvh] w-full relative mb-24">
        <Image
          src={data?.data?.banner ?? `https://placehold.co/1400x400`}
          alt={data?.data?.name ?? "Category Banner"}
          fill
          priority
          sizes="100vw"
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

      <section className="pt-12 space-y-6 w-2/3 mx-auto text-center">
        <h1 className="text-3xl font-bold">{data?.data?.name}</h1>
        <p className="text-muted-foreground">{data?.data?.description}</p>
      </section>

      <section className="mt-24">
        <ProductSet products={data?.data?.products} />
      </section>
    </main>
  );
}
