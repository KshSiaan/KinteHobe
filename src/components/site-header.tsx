"use client";

import { SearchForm } from "@/components/search-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import { PanelLeftIcon, PencilRulerIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Link from "next/link";

// Format segment to readable text (e.g., "dashboard" -> "Dashboard")
const formatSegment = (segment: string) => {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname();

  // Generate breadcrumb items from pathname
  const segments = pathname
    .split("/")
    .filter((segment) => segment && segment !== "(view)" && segment !== "(me)");

  // Build breadcrumb path array
  const breadcrumbs = segments.map((segment, index) => {
    const path = "/" + segments.slice(0, index + 1).join("/");
    return {
      label: formatSegment(segment),
      path,
      isLast: index === segments.length - 1,
    };
  });

  return (
    <header className="sticky top-0 z-50 flex w-full items-center border-b bg-background">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <PanelLeftIcon />
        </Button>
        <Separator
          orientation="vertical"
          className="mr-2 data-vertical:h-4 data-vertical:self-auto"
        />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center gap-2">
                <BreadcrumbItem>
                  {crumb.isLast ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={crumb.path}>
                      {crumb.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!crumb.isLast && <BreadcrumbSeparator />}
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center space-x-2 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant={"outline"}>
                <PencilRulerIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href={"/admin/dashboard/tools/notepad"}>Notepad</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={"/admin/dashboard/tools/kanban"}>Kanban</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={"/admin/dashboard/tools/draw"}>Draw</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <SearchForm className="w-full sm:ml-auto sm:w-auto" />
        </div>
      </div>
    </header>
  );
}
