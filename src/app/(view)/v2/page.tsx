import Image from "next/image";
import React, { Suspense } from "react";
import HeroWrapper from "../home/hero-wrapper";
import { StarsIcon } from "lucide-react";

export default function Page() {
  return (
    <>
      <header className="h-[70dvh] w-full flex flex-col">
        <div className="w-full grid md:grid-cols-7 gap-4 flex-1 p-4">
          <div className="md:col-span-5  w-full h-full rounded-2xl relative border border-border overflow-hidden">
            <Suspense>
              {/* 1400 X 630 */}
              <HeroWrapper fill />
            </Suspense>
          </div>
          <div className="md:col-span-2  w-full h-full grid grid-rows-2 gap-4 *:border *:rounded-2xl">
            <div className="w-full h-full relative p-4!">
              <div className="flex items-center justify-start gap-2 font-semibold">
                <StarsIcon className="size-4" /> <h4>Khuki's Favorite</h4>
              </div>
              <Image
                src="/illust/khuki-sit.webp"
                height={248}
                width={248}
                alt="Khuki sitting"
                className="object-contain absolute h-34 w-34 aspect-square bottom-0 right-0 "
              />
            </div>
            <div className="w-full h-full"></div>
          </div>
        </div>
        {/* <div className="h-18 bg-foreground w-full"></div> */}
      </header>
      <main></main>
    </>
  );
}
