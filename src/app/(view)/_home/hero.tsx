"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import React from "react";

type BannerResponse = {
  data: string;
};

export default function Hero() {
  const { data, isPending } = useQuery<BannerResponse>({
    queryKey: ["fetchBanner"],
    queryFn: async () => {
      const res = await fetch("/api/banner");
      if (!res.ok) throw new Error("Failed to fetch banner");
      return res.json();
    },
  });

  const bannerUrl = data?.data;

  return (
    <header className="bg-background h-[60dvh] border-b">
      <Image
        className="w-full h-full object-cover"
        src={bannerUrl || "/placeholder-banner.webp"}
        width={1920}
        height={1080}
        alt="banner"
        priority
      />
    </header>
  );
}
