"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateResponseType } from "@/lib/backend/message";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import React from "react";

export default function MinimalCategories() {
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
  if (isPending) {
    return Array.from({ length: 8 }).map((_, i) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
      <Skeleton key={i} className="h-32 rounded-none border-dashed" />
    ));
  }
  return data?.data.map((category) => (
    <Link href={"#"} key={category.id}>
      <Card className="p-0! flex flex-col transition-transform relative rounded-none shadow-none border-dashed overflow-visible">
        <CardContent className="text-center py-4">
          <h4 className="text-base font-bold">{category.name}</h4>
        </CardContent>
      </Card>
    </Link>
  ));
}
