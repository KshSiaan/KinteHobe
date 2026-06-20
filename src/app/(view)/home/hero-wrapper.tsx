"use client";

import dynamic from "next/dynamic";

const Hero = dynamic(() => import("./hero"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[30dvh] lg:h-[60dvh] bg-muted/50 animate-pulse rounded-lg" />
  ),
});

export default function HeroWrapper() {
  return <Hero />;
}
