import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const iframeHeight = "800px";

export const description = "A sidebar with a header and a search form.";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await auth.api.getSession({
    headers: await headers(),
  });
  if (data?.user?.role !== "admin") {
    return notFound();
  }
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <Suspense fallback={null}>
        <SidebarProvider className="flex flex-col">
          <SiteHeader />
          <div className="flex flex-1 ">
            <AppSidebar />
            <SidebarInset className="bg-secondary">{children}</SidebarInset>
          </div>
        </SidebarProvider>
      </Suspense>
    </div>
  );
}
