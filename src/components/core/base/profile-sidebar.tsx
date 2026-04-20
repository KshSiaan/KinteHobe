"use client";

import {
  UserCircle,
  Package2,
  Settings,
  MoreHorizontal,
  MenuIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const MENU_ITEMS = [
  { label: "Profile", icon: UserCircle, href: "/" },
  { label: "Orders", icon: Package2, href: "/orders" },
  { label: "Settings", icon: Settings, href: "/settings" },
  { label: "More", icon: MoreHorizontal, href: "/more" },
];

export function ProfileSidebar() {
  const pathname = usePathname();

  // Get current page label from MENU_ITEMS
  const getCurrentPageLabel = () => {
    const menuItem = MENU_ITEMS.find((item) => {
      const fullHref = `/me${item.href === "/" ? "" : item.href}`;
      return pathname === fullHref;
    });
    return menuItem?.label || "Profile";
  };

  const currentPageLabel = getCurrentPageLabel();

  return (
    <>
      {" "}
      <nav className="fixed h-14 border-b z-30 top-26 bg-background w-full flex justify-between items-center px-6">
        {/* Header - Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/me">Profile</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {currentPageLabel !== "Profile" && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{currentPageLabel}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Navigation Items */}
        <nav className="flex items-center gap-1">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const fullHref = `/me${item.href === "/" ? "" : item.href}`;
            const isActive = pathname === fullHref;

            return (
              <Link
                key={item.label}
                href={fullHref}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  "hover:bg-sidebar-accent/50",
                  isActive
                    ? "bg-background text-primary border-b"
                    : "text-sidebar-foreground",
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </nav>
      <div className="h-14"></div>
    </>
  );
}
