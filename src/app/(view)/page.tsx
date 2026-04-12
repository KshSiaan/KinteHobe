import { Icons } from "@/components/card-8";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import Link from "next/link";
import React from "react";

export default function Home() {
  return (
    <>
      <header
        className="bg-background h-[60dvh] border-b bg-contain bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/img/banner.webp')` }}
      />
      <main>
        <section className="container mx-auto grid grid-cols-6 gap-12 my-24">
          {Array.from({ length: 6 }).map((_, i) => (
            <Link href={"#"} key={i}>
              <Card className="p-0! aspect-square hover:scale-105 transition-transform relative rounded-none shadow-none border-dashed overflow-visible">
                <Icons />
                <CardContent className="size-full"></CardContent>
              </Card>
              <div className="w-full text-center mt-4">lol</div>
            </Link>
          ))}
        </section>
        <section className="bg-muted my-24 py-12">
          <div className="container mx-auto pb-12">
            <h2 className="text-base font-semibold">Your daily discover</h2>
          </div>
          <div className="grid grid-cols-4 container mx-auto">
            {Array.from({ length: 28 }).map((_, i) => (
              <Link href={"#"} key={i}>
                <Card className="p-0! aspect-square flex flex-col transition-transform relative rounded-none shadow-none border-dashed overflow-visible">
                  <CardHeader className="w-full aspect-video  rounded-none"></CardHeader>
                  <CardContent>
                    <h4 className="text-base font-bold">Card Title</h4>
                    <p className="line-clamp-2">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Iure recusandae impedit sit, quo velit hic, optio numquam
                      magni ex incidunt nesciunt iusto animi quibusdam eaque ea
                      voluptates itaque, temporibus ullam?
                    </p>
                  </CardContent>
                  <CardFooter className="flex-1 w-full flex justify-start items-center pb-6 gap-2">
                    <p className="text-lg font-semibold">400/-</p>
                    <p className="text-destructive opacity-70 line-through">
                      599/-
                    </p>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </section>
        <section className="container mx-auto py-12">
          <h2 className="text-base font-semibold">Top Categories</h2>
          <div className="grid grid-cols-4 gap-6 mt-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Link href={"#"} key={i}>
                <Card className="p-0! flex flex-col transition-transform relative rounded-none shadow-none border-dashed overflow-visible">
                  <CardContent className="text-center py-4">
                    <h4 className="text-base font-bold">Category {i + 1}</h4>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
        <section className="container mx-auto py-12">
          <h2 className="text-base font-semibold">Featured Products</h2>
          <div className="grid grid-cols-4 container mx-auto mt-12">
            {Array.from({ length: 28 }).map((_, i) => (
              <Link href={"#"} key={i}>
                <Card className="p-0! aspect-square flex flex-col transition-transform relative rounded-none shadow-none border-dashed overflow-visible">
                  <CardHeader className="w-full aspect-video  rounded-none"></CardHeader>
                  <CardContent>
                    <h4 className="text-base font-bold">Card Title</h4>
                    <p className="line-clamp-2">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Iure recusandae impedit sit, quo velit hic, optio numquam
                      magni ex incidunt nesciunt iusto animi quibusdam eaque ea
                      voluptates itaque, temporibus ullam?
                    </p>
                  </CardContent>
                  <CardFooter className="flex-1 w-full flex justify-start items-center pb-6 gap-2">
                    <p className="text-lg font-semibold">400/-</p>
                    <p className="text-destructive opacity-70 line-through">
                      599/-
                    </p>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
