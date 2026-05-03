import Navbar from "@/components/core/base/navbar";
import { DetailedFooter } from "@/components/footer-detailed";
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
      {/* <DetailedFooter /> */}
    </>
  );
}
