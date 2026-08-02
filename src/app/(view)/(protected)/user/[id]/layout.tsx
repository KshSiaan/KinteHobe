import Loading from "@/app/loading";
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
      {/* <Navbar /> */}
      <main className="w-full min-h-screen">
        {/* <ProfileSidebar /> */}
        <div className="">
          <Suspense
            fallback={
              <div className="h-full! w-full flex justify-center items-center">
                <Loading />
              </div>
            }
          >
            {children}
          </Suspense>
        </div>
      </main>
      <DetailedFooter />
    </>
  );
}
