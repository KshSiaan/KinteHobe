import Navbar from "@/components/core/base/navbar";
import { ProfileSidebar } from "@/components/core/base/profile-sidebar";
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
      <main className="w-full min-h-screen">
        <ProfileSidebar />
        <div className="">
          <Suspense fallback={null}>{children}</Suspense>
        </div>
      </main>
      <DetailedFooter />
    </>
  );
}
