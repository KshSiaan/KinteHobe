import Navbar from "@/components/core/base/navbar";
import { DetailedFooter } from "@/components/footer-detailed";
import { Button } from "@/components/ui/button";
import {
  EllipsisIcon,
  Package2Icon,
  Settings2Icon,
  UserCircle,
} from "lucide-react";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

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
  const data = await auth?.api?.getSession({
    headers: await headers(),
  });

  if (!data?.user?.id && !data?.user?.email) {
    return notFound();
  }

  return (
    <>
      <Navbar />
      <main className="grid grid-cols-6 w-full min-h-screen">
        <aside className="p-4 space-y-2 bg-secondary">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Button key={item.label} variant={"secondary"} className="w-full">
                <Icon />
                {item.label}
              </Button>
            );
          })}
        </aside>
        <div className="col-span-5 ">{children}</div>
      </main>
      <DetailedFooter />
    </>
  );
}
