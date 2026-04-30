"use client";
import { Spinner } from "@/components/kibo-ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import type { CreateResponseType } from "@/lib/backend/message";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";

export default function DailyDiscover() {
  const { data, isPending } = useQuery({
    queryKey: ["dailyDiscover"],
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

  isPending && (
    <div className="col-span-4 flex justify-center items-center">
      <Spinner variant="infinite" />
    </div>
  );

  return data?.data?.map((product) => {
    const base = product.variants.find((v) => v.kind === "base");
    const colors = product?.variants
      .filter((v) => v.kind === "color")
      .map((v) => v.code)
      .filter((value): value is string => Boolean(value));
    return (
      <Card
        key={base?.id}
        className="p-0! flex flex-col transition-transform relative rounded-none shadow-none border-dashed overflow-visible"
      >
        <CardHeader className="w-full aspect-video rounded-none relative">
          {base?.compareAtPrice && (
            <Badge
              className="absolute z-20 top-2 left-2 bg-background/40 text-primary backdrop-blur-sm border border-primary/20 py-3!"
              variant={"outline"}
            >
              {base && base.compareAtPrice && base.compareAtPrice !== base.price
                ? `${Math.round(
                    ((parseFloat(base.compareAtPrice) -
                      parseFloat(base.price)) /
                      parseFloat(base.compareAtPrice)) *
                      100,
                  )}%`
                : null}{" "}
              off
            </Badge>
          )}
          <Link href={`/product/${product.slug}`} key={product.id}>
            <Image
              src={base?.publicImages[0] || "https://placehold.co/400"}
              alt={product.title}
              fill
              className="object-cover"
            />
          </Link>
        </CardHeader>
        {/* {base?.publicImages[0]} */}

        <CardContent>
          <Link
            href={`/product/${product.slug}`}
            key={product.id}
            className="h-full"
          >
            <h4 className="text-base font-bold">{product.title}</h4>
            <p className="line-clamp-2">
              {product?.description ?? "Description not available"}
            </p>
          </Link>
        </CardContent>
        <CardFooter className="flex-1 w-full flex justify-start items-center pb-6 gap-2">
          <p className="text-lg font-semibold">
            {base ? `₹${base.price}` : "Price not available"}
          </p>
          <p className="text-destructive opacity-70 line-through">
            {base && base.compareAtPrice && base.compareAtPrice !== base.price
              ? `₹${base.compareAtPrice}`
              : ""}
          </p>
        </CardFooter>
        <CardFooter className="grid grid-cols-2 gap-2 w-full pb-4">
          <div className="font-semibold text-muted-foreground">
            {product.variants
              .filter((v) => v.kind === "size")
              ?.map((v) => v.code)
              .join(", ") || ""}
          </div>
          <div className="flex items-center justify-end gap-2">
            {colors?.map((color) => (
              <Button
                key={color}
                className={cn(
                  "rounded-full! size-6! p-0! hover:ring-4 ring-zinc-500/20",
                )}
                style={{ backgroundColor: color }}
              ></Button>
            ))}
          </div>
        </CardFooter>
      </Card>
    );
  });
}
