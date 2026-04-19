import Navbar from "@/components/core/base/navbar";
import { ProfileSidebar } from "@/components/core/base/profile-sidebar";
import { DetailedFooter } from "@/components/footer-detailed";
import { Button } from "@/components/ui/button";
import {
  EllipsisIcon,
  Package2Icon,
  Settings2Icon,
  UserCircle,
} from "lucide-react";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const MENU_ITEMS = [
    { label: "Profile", icon: UserCircle },
    { label: "Orders", icon: Package2Icon },
    { label: "Settings", icon: Settings2Icon },
    { label: "Extra", icon: EllipsisIcon },
  ];

  // if (!data?.user?.id && !data?.user?.email) {
  //   return notFound();
  // }

  return (
    <>
      <Navbar />

      <main className="grid grid-cols-6 w-full min-h-screen">
        <ProfileSidebar />
        <div className="col-span-5 ">{children}</div>
      </main>
      <DetailedFooter />
    </>
  );
}
