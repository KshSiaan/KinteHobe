import { ManagerSidebar } from "@/components/manager-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

export const iframeHeight = "800px";

export const description = "A sidebar with a header and a search form.";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const data = await auth?.api?.getSession({
    headers: await headers(),
  });
  if (data?.user?.role !== "manager") {
    return notFound();
  }
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1 ">
          <ManagerSidebar />
          <SidebarInset className="bg-secondary relative">
            {children}
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
