"use client";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import React from "react";
import { Icons } from "@/components/card-8";
import { useQuery } from "@tanstack/react-query";
import { CreateResponseType } from "@/lib/backend/message";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
export default function Categories() {
  const { data, isPending } = useQuery({
    queryKey: ["fetchCategories"],
    queryFn: async (): Promise<
      CreateResponseType<{
        data: {
          id: string;
          name: string;
          slug: string;
          image: string;
          banner: string;
          description: string;
          isActive: boolean;
          metaTitle: string;
          metaDescription: string;
          createdAt: string;
          updatedAt: string;
        }[];
      }>
    > => {
      const res = await fetch("/api/category");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  isPending &&
    Array.from({ length: 6 }).map((_, i) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: test purpose only
      <div key={i} className="block">
        <div className="aspect-square rounded-none border-dashed overflow-hidden">
          <Skeleton className="h-full w-full" />
        </div>

        <div className="mt-4 text-center">
          <Skeleton className="h-4 w-16 mx-auto" />
        </div>
      </div>
    ));

  return data?.data.map((category) => (
    <Link href={`/categories/${category.slug}`} key={category.id}>
      <Card className="p-0! aspect-square border-0! ring-0! hover:scale-105 transition-transform relative rounded-none shadow-none border-dashed overflow-visible">
        <Icons />
        <CardContent className="size-full flex justify-center items-center relative">
          <Image
            alt={category.slug}
            height={128}
            width={128}
            className=""
            src={category?.image || "https://placehold.co/100"}
          />
        </CardContent>
      </Card>
      <div className="w-full text-center mt-4">
        <h3 className="text-sm font-medium">{category.name}</h3>
      </div>
    </Link>
  ));
}
