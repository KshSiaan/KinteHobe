"use client";
import { Spinner } from "@/components/kibo-ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { howl } from "@/lib/utils";
import { ClipboardIcon, InboxIcon } from "@animateicons/react/lucide";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBasketIcon, StarCheckIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useClipboard } from "react-haiku";

type RecentOrders = Array<{
  id: string;
  totalCents: number;
  items: Array<{ id: string }>;
}>;

export default function Recent() {
  const clipboard = useClipboard({ timeout: 1000 });
  const { data, isPending } = useQuery({
    queryKey: ["recent_order"],
    queryFn: (): Promise<{
      message: string;
      ok: boolean;
      data: Array<{
        id: string;
        orderItemId: string;
        status: string;
        createdAt: string;
        updatedAt: string;
        productTitle: string;
        variantTitle: string;
        sku: string;
        imageUrl: string;
        quantity: number;
        lineTotalCents: number;
        product: {
          id: string;
          slug: string;
          categoryId: string;
          status: string;
          variantIds: Array<string>;
          createdAt: string;
          updatedAt: string;
        };
      }>;
    }> => {
      return howl("/api/me/recent-order");
    },
  });
  return (
    <>
      <h2 className="text-xl font-semibold">Recent Order</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 w-full">
        {data?.data.length === 0 && (
          <Empty className="md:grid-cols-2 lg:col-span-4 border border-border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <InboxIcon />
              </EmptyMedia>
              <EmptyTitle>No recent orders</EmptyTitle>
              <EmptyDescription>
                You haven't placed any orders yet
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild>
                <Link href="/products?preference=best_selling">
                  Explore Bestsellers
                </Link>
              </Button>
            </EmptyContent>
          </Empty>
        )}
        {data?.data && data?.data.length > 0 && (
          <Card className="col-span-4 shadow-none">
            <CardContent className="flex flex-col md:flex-row justify-start items-center gap-6">
              <div className="h-full space-y-2">
                <Image
                  src={data?.data[0]?.imageUrl || "/placeholder.jpg"}
                  alt={data?.data[0]?.productTitle || ""}
                  height={524}
                  width={524}
                  className="h-64 w-64 rounded-lg border object-contain"
                />
                <Button variant="success" className="w-full">
                  Drop a Review <StarCheckIcon />
                </Button>
                <Button variant="outline" className="w-full">
                  Buy Again <ShoppingBasketIcon />
                </Button>
              </div>
              <div className="flex-1 grid sm:grid-cols-3 gap-3">
                {/* Product */}
                <div className="sm:col-span-3 rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground mb-1">Product</p>
                  <Link href={`/product/${data?.data[0]?.product?.slug}`}>
                    <CardTitle className="text-base hover:underline hover:text-primary">
                      {data?.data[0]?.productTitle}
                    </CardTitle>
                  </Link>
                </div>

                {/* Status */}
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <Badge variant="info">{data?.data[0]?.status}</Badge>
                </div>

                {/* Price */}
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground mb-1">Total</p>
                  <p className="font-semibold">
                    ${((data?.data[0]?.lineTotalCents ?? 0) / 100).toFixed(2)}
                  </p>
                </div>

                {/* Quantity */}
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground mb-1">Quantity</p>
                  <p className="font-medium">{data?.data[0]?.quantity || 0}</p>
                </div>

                {/* Order ID */}
                <div className="sm:col-span-2 rounded-lg border p-4">
                  <div className="flex items-center justify-start gap-2 mb-1">
                    <p className="text-xs text-muted-foreground ">Order ID</p>
                    <Button size="xs" variant="outline">
                      <ClipboardIcon /> Copy
                    </Button>
                  </div>
                  <CardDescription className="font-mono">
                    {data?.data[0]?.id}
                  </CardDescription>
                </div>

                {/* Date */}
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    Ordered on
                  </p>
                  <CardDescription>{data?.data[0]?.createdAt}</CardDescription>
                </div>

                {/* SKU */}
                <div className="sm:col-span-3 rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground mb-1">SKU</p>
                  <CardDescription className="font-mono">
                    {data?.data[0]?.sku || "N/A"}
                  </CardDescription>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
