"use client";
import { Badge } from "@/components/ui/badge";
import { CreateResponseType } from "@/lib/backend/message";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Recent() {
  const { data } = useQuery({
    queryKey: ["dailyDiscovers"],
    queryFn: async (): Promise<
      CreateResponseType<{
        data: {
          id: string;
          slug: string;
          title: string;
          description: string;
          category: {
            id: string;
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
          categoryId: string;
          status: string;
          variantIds: Array<string>;
          createdAt: string;
          updatedAt: string;
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
            publicImages: Array<string>;
          }>;
        }[];
      }>
    > => {
      const res = await fetch("/api/product");
      const data = await res.json();
      return data;
    },
  });

  return data?.data?.slice(0, 3).map((item) => {
    const base = item.variants.find((v) => v.kind === "base");

    return (
      <Link key={item.id} href={`/product/${item.slug}`}>
        <div className="h-full w-full relative rounded-xl overflow-hidden hover:*:scale-105 transition-transform duration-300">
          {base?.compareAtPrice && base.price !== base.compareAtPrice && (
            <Badge
              className="absolute z-20 top-2 left-2 bg-background/40 text-primary backdrop-blur-sm border border-primary/20 py-3!"
              variant="outline"
            >
              {`${Math.round(
                ((parseFloat(base.compareAtPrice) - parseFloat(base.price)) /
                  parseFloat(base.compareAtPrice)) *
                  100,
              )}%`}{" "}
              off
            </Badge>
          )}

          <Image
            src={item.variants[0]?.publicImages[0] || "/placeholder.png"}
            alt={item.title}
            fill
            className="object-cover"
          />
        </div>
      </Link>
    );
  });
}
