"use client";

import { UserCircle, Package2, Settings, MoreHorizontal } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const MENU_ITEMS = [
  { label: "Profile", icon: UserCircle, href: "/" },
  { label: "Orders", icon: Package2, href: "/orders" },
  { label: "Settings", icon: Settings, href: "/settings" },
  { label: "More", icon: MoreHorizontal, href: "/more" },
];

export function ProfileSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 h-screen border-r border-border bg-sidebar text-sidebar-foreground flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Profile
        </h2>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const fullHref = `/me${item.href === "/" ? "" : item.href}`;
          const isActive = pathname === fullHref;

          return (
            <Link
              key={item.label}
              href={fullHref}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                "hover:bg-sidebar-accent/50",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground",
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <p className="text-xs text-muted-foreground">v0.1</p>
      </div>
    </aside>
  );
}
