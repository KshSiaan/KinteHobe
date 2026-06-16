import AiAssistant from "@/components/core/base/ai-assistant";
import Navbar from "@/components/core/base/navbar";
import { DetailedFooter } from "@/components/footer-detailed";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Suspense } from "react";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <Suspense fallback={<>loading..</>}>{children}</Suspense>
      <AiAssistant />
      <DetailedFooter />
    </>
  );
}
