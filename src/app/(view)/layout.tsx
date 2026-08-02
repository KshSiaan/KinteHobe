import AiAssistant from "@/components/core/base/ai-assistant";
import Navbar from "@/components/core/base/navbar";
import { DetailedFooter } from "@/components/footer-detailed";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Suspense } from "react";
import Loading from "../loading";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <Suspense
        fallback={
          <div className="h-full! w-full flex justify-center items-center">
            <Loading />
          </div>
        }
      >
        {children}
      </Suspense>
      <AiAssistant />
      <DetailedFooter />
    </>
  );
}
