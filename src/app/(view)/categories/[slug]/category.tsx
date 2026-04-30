"use client";
import { Spinner } from "@/components/kibo-ui/spinner";
import { CreateResponseType } from "@/lib/backend/message";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import React from "react";

export default function Category({ slug }: { slug: string }) {
  const { data, isPending } = useQuery({
    queryKey: ["category", slug],
    queryFn: async (): Promise<
      CreateResponseType<{
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
      }>
    > => {
      const res = await fetch(`/api/client/category/${slug}`);
      return res.json();
    },
  });
  isPending && (
    <div className="h-[50dvh] flex justify-center items-center">
      <Spinner variant="infinite" />
    </div>
  );
  return (
    <>
      <header className="h-[40dvh] w-full relative">
        <Image
          src={data?.data?.banner ?? `https://placehold.co/1400x400`}
          alt={data?.data?.name ?? "Category Banner"}
          fill
          className="object-cover"
        />
      </header>
      {/* <pre className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-amber-400 rounded-xl p-6 shadow-lg overflow-x-auto text-sm leading-relaxed border border-zinc-700">
        <code className="whitespace-pre-wrap">
          {JSON.stringify(data, null, 2)}
        </code>
      </pre> */}
      <section>{data?.data?.banner}</section>
    </>
  );
}
