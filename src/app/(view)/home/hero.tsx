"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";

type HeroProps = {
  fill?: boolean;
};

type BannerResponse = {
  data: string;
};

export default function Hero({ fill = false }: HeroProps) {
  const { data } = useQuery<BannerResponse>({
    queryKey: ["fetchBanner"],
    queryFn: async () => {
      const res = await fetch("/api/banner");
      if (!res.ok) throw new Error("Failed to fetch banner");
      return res.json();
    },
  });

  const bannerUrl = data?.data;

  return (
    <Image
      className="object-contain"
      src={bannerUrl || "/img/cover-test.svg"}
      alt="banner"
      priority
      {...(fill ? { fill: true } : { width: 1920, height: 1080 })}
      sizes="100vw"
    />
  );
}
