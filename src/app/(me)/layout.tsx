import Navbar from "@/components/core/base/navbar";
import { ProfileSidebar } from "@/components/core/base/profile-sidebar";
import { DetailedFooter } from "@/components/footer-detailed";

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
        <div className="">{children}</div>
      </main>
      <DetailedFooter />
    </>
  );
}
