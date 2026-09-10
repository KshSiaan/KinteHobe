import Image from "next/image";
import React, { Suspense } from "react";
import HeroWrapper from "../home/hero-wrapper";
import { ArrowUpRight, ClockIcon, StarsIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Recent from "./recent";
import { Button } from "@/components/ui/button";
import Orders from "./orders";

export default function Page() {
  return (
    <>
      <header className="h-[70dvh] w-full flex flex-col">
        <div className="w-full grid md:grid-cols-7 gap-4 flex-1 p-4 pb-2">
          <div className="md:col-span-5  w-full h-full rounded-2xl relative border border-border overflow-hidden">
            <Suspense>
              {/* 1400 X 630 */}
              <HeroWrapper fill />
            </Suspense>
          </div>
          <div className="md:col-span-2  w-full h-full grid grid-rows-2 gap-4 *:border *:rounded-2xl">
            <div className="w-full h-full relative p-4! flex flex-col gap-4">
              <div className="flex items-center justify-start gap-2 font-semibold">
                <StarsIcon className="size-4" /> <h4>Khuki's Favorite</h4>
              </div>
              <div className="flex-1 w-full mb-[10%] grid grid-cols-3 gap-4">
                <Suspense
                  fallback={
                    <>
                      <Skeleton className="w-full h-full" />
                      <Skeleton className="w-full h-full" />
                      <Skeleton className="w-full h-full" />
                    </>
                  }
                >
                  <Recent />
                </Suspense>
              </div>
              <Image
                src="/illust/khuki-sit.webp"
                height={248}
                width={248}
                alt="Khuki sitting"
                className="object-contain absolute h-34 w-34 aspect-square bottom-0 right-0 "
              />
            </div>
            <div className="w-full h-full relative p-4! flex flex-col gap-4 text-background bg-foreground">
              <div className="flex items-center justify-start gap-2 font-semibold">
                <ClockIcon className="size-4" /> <h4>Last Orders</h4>
              </div>
              <div className="flex-1 w-full grid grid-rows-4 divide-y divide-border/10">
                <Orders />
              </div>
            </div>
          </div>
        </div>
      </header>
      <main>
        <section className="p-4 py-2">
          <div className="w-full flex justify-between items-center">
            <h2 className="text-lg font-bold">Browse Categories</h2>
            <Button
              variant="link"
              size="sm"
              className="flex items-center gap-2"
            >
              See all <ArrowUpRight className="size-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Suspense fallback={null}></Suspense>
          </div>
        </section>
      </main>
    </>
  );
}
