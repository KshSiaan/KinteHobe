import Image from "next/image";
import React, { Suspense } from "react";
import HeroWrapper from "../home/hero-wrapper";
import {
  ArrowUpRight,
  ClockIcon,
  MessageCircleIcon,
  RefreshCw,
  SearchIcon,
  ShieldCheck,
  StarsIcon,
  TruckIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Recent from "./recent";
import { Button } from "@/components/ui/button";
import Orders from "./orders";
import Categories from "./categories";
import Link from "next/link";
import DailyDiscover from "../home/daily-discover";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import SearchAI from "./search";

export default function Home() {
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
                <Suspense fallback={<></>}>
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
                <ClockIcon className="size-4" /> <h4>Global Update</h4>
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
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
            <Suspense fallback={skeletonCreator(6)}>
              <Categories />
            </Suspense>
          </div>
        </section>
        <section className="p-4 py-2">
          <div className="w-full flex justify-between items-center">
            <h2 className="text-lg font-bold">Daily Discoveries</h2>
            <Button
              variant="link"
              size="sm"
              className="flex items-center gap-2"
              asChild
            >
              <Link href={"/products?preference=trending"}>
                See all <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-4">
            <Suspense fallback={skeletonCreator(4)}>
              <DailyDiscover />
            </Suspense>
          </div>
        </section>
        <section className="p-4 py-2 ">
          <Card className="bg-foreground text-background gap-4">
            <CardHeader className="flex items-center gap-4">
              <Image
                src="/assistant-icon.webp"
                height={64}
                width={64}
                alt="Khuki AI"
                className="rounded-full size-8"
              />
              <CardTitle>Khuki AI</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-center gap-4">
              <h3 className="text-2xl font-semibold">
                Cant find what you're looking for?
              </h3>
              <div className="w-1/3 flex justify-between items-center gap-4">
                <Suspense fallback="Loading...">
                  <SearchAI />
                </Suspense>
              </div>
            </CardContent>
            <CardFooter>
              <CardDescription>
                Tell Khuki exactly what you want - She will search , compare and
                find the <br /> best deal for you instantly.
              </CardDescription>
            </CardFooter>
          </Card>
        </section>
        <section className="p-4 py-2">
          <div className="w-full flex justify-between items-center">
            <h2 className="text-lg font-bold">Featured Products</h2>
            <Button
              variant="link"
              size="sm"
              className="flex items-center gap-2"
              asChild
            >
              <Link href={"/products?preference=trending"}>
                See all <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-4">
            <Suspense fallback={skeletonCreator(4)}>
              <DailyDiscover />
            </Suspense>
          </div>
        </section>
        <section className="p-4 pt-2 mt-24 grid md:grid-cols-4 h-20 divide-x *:pl-4">
          <div className="flex items-center gap-4 pl-0!">
            <div className="p-4 bg-muted aspect-square rounded-4xl text-blue-700">
              <TruckIcon />
            </div>
            <div className="">
              <h4 className="font-bold text-sm">Free Delivery</h4>
              <p className="text-xs text-muted-foreground">
                On orders above 499 cities Nationwide
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-muted aspect-square rounded-4xl text-green-700">
              <ShieldCheck />
            </div>
            <div className="">
              <h4 className="font-bold text-sm">Secure Payments</h4>
              <p className="text-xs text-muted-foreground">
                SSL encrypted transactions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-muted aspect-square rounded-4xl text-amber-700">
              <RefreshCw />
            </div>
            <div className="">
              <h4 className="font-bold text-sm">Easy Return</h4>
              <p className="text-xs text-muted-foreground">
                7 Day hassle free return policy
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-muted aspect-square rounded-4xl text-blue-700">
              <TruckIcon />
            </div>
            <div className="">
              <h4 className="font-bold text-sm">24/7 AI Support</h4>
              <p className="text-xs text-muted-foreground">
                Khuki AI + Admin Support
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

const skeletonCreator = (count: number) => {
  return Array.from({ length: count }).map((_, i) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: test purpose only
    <Skeleton className="w-full h-full" key={i} />
  ));
};
