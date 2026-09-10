"use client";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function Orders() {
  const { data, isPending } = useQuery({
    queryKey: ["recentOrders"],
    queryFn: async (): Promise<{
      message: string;
      ok: boolean;
      data: {
        title: string;
        slug: string;
      }[];
    }> => {
      const response = await fetch("/api/order/recent");
      if (!response.ok) {
        throw new Error("Failed to fetch recent orders");
      }
      return response.json();
    },
  });
  const uId = React.useId();
  return data?.data?.map((item, index) => (
    <div className="flex justify-between items-center " key={uId}>
      <div className="flex items-center gap-2">
        <h5>{index + 1}</h5> <p className="text-sm">{item.title}</p>
      </div>
      <Button variant="ghost" size="xs" asChild>
        <Link href={`/product/${item.slug}`}>
          Take a look <ArrowUpRight />
        </Link>
      </Button>
    </div>
  ));
}
