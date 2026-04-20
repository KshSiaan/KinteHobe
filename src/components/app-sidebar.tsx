"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  TerminalSquareIcon,
  BotIcon,
  BookOpenIcon,
  Settings2Icon,
  LifeBuoyIcon,
  SendIcon,
  FrameIcon,
  PieChartIcon,
  MapIcon,
  TerminalIcon,
  FileCogIcon,
  ComputerIcon,
} from "lucide-react";
import Link from "next/link";

const data = {
  user: {
    name: "ADMIN",
    email: "admin@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Platform Overview",
      url: "#",
      icon: <TerminalSquareIcon />,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/",
        },
        {
          title: "Users",
          url: "/users",
        },
        // {
        //   title: "Revenue Analytics",
        //   url: "/revenue-analytics",
        // },
      ],
    },
    {
      title: "Product & Managers",
      url: "#",
      icon: <BotIcon />,
      items: [
        {
          title: "Managers",
          url: "/managers",
        },
        {
          title: "Product Listing",
          url: "/products",
        },
        {
          title: "Product Categories",
          url: "/product-categories",
        },
        {
          title: "Coupons & Discounts",
          url: "/coupons",
        },
      ],
    },
    {
      title: "Orders & Insights",
      url: "#",
      icon: <BookOpenIcon />,
      items: [
        {
          title: "Orders",
          url: "/orders",
        },
        {
          title: "Insights",
          url: "/insights",
        },
        {
          title: "Transactions",
          url: "/transactions",
        },
      ],
    },
    {
      title: "Others",
      url: "#",
      icon: <BookOpenIcon />,
      items: [
        {
          title: "Promotions",
          url: "/promotions",
        },
        {
          title: "Banners",
          url: "/banners",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: <LifeBuoyIcon />,
    },
    {
      title: "Feedback",
      url: "#",
      icon: <SendIcon />,
    },
    {
      title: "Pages",
      url: "/pages",
      icon: <FileCogIcon />,
    },
    {
      title: "Developer",
      url: "/dev",
      icon: <ComputerIcon />,
    },
  ],
  projects: [
    {
      name: "Sales & Marketing",
      url: "/sales-marketing",
      icon: <PieChartIcon />,
    },
    {
      name: "Manager Feedbacks",
      url: "/manager-feedbacks",
      icon: <LifeBuoyIcon />,
    },
  ],
};

const AppName = process.env.NEXT_PUBLIC_APP_NAME || "Kintehobe";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <TerminalIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{AppName}</span>
                  <span className="truncate text-xs">Inc.</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
