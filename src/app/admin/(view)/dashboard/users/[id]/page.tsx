import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { auth } from "@/lib/auth";
import type { orderStatusEnum } from "@/db/schema";

import {
  CalendarDaysIcon,
  MessageSquareIcon,
  MoreVerticalIcon,
  ShieldBanIcon,
} from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import Ban from "./ban";
import { Badge } from "@/components/ui/badge";
import Impersonate from "./impersonate";
import ChangeRole from "./changeRole";
import Saved from "./saved";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RecentOrders from "./recent-orders";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await auth.api.getUser({
    headers: await headers(),
    query: { id },
  });

  const info = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/user/info?id=${id}`,
    {
      headers: await headers(),
    },
  );

  const userInfo: {
    message: string;
    ok: boolean;
    user: {
      id: string;
      name: string;
      email: string;
      emailVerified: boolean;
      image: string;
      role: string;
      banned: boolean;
      banReason: string | null;
      banExpires: string | null;
      createdAt: string;
      updatedAt: string;
    };
    counts: {
      followers: number;
      following: number;
      wishlist: number;
      orders: number;
    };
    wishlist: {
      wishlist: {
        id: string;
        productId: string;
        userId: string;
        createdAt: string;
      };
      product: {
        id: string;
        slug: string;
        categoryId: string;
        status: string;
        variantIds: string[];
        createdAt: string;
        updatedAt: string;
      };
      product_variant: {
        id: string;
        groupId: string;
        code: string | null;
        sku: string;
        price: string;
        compareAtPrice: number | null;
        stockQuantity: number;
        weight: string;
        details: string;
        metadata: {
          id: string;
          name: string;
          description: string;
        }[];
        position: number;
        kind: string;
        enabled: boolean;
        title: string;
        optionName: string | null;
        images: string[];
        createdAt: string;
        bodySearch: string;
        updatedAt: string;
      };
    }[];
    recentOrders: {
      id: string;
      userId: string;
      email: string;
      status: (typeof orderStatusEnum.enumValues)[number];
      shippingName: string;
      shippingPhone: string;
      shippingAddress: string;
      shippingCity: string;
      shippingState: string;
      shippingZip: string;
      shippingCountry: string;
      subtotalCents: number;
      taxCents: number;
      shippingCents: number;
      totalCents: number;
      paymentMethod: string;
      stripeSessionId: string | null;
      createdAt: string;
      updatedAt: string;
      items: {
        id: string;
        orderId: string;
        productId: string;
        variantId: string;
        productTitle: string;
        variantTitle: string;
        sku: string;
        quantity: number;
        unitPriceCents: number;
        lineTotalCents: number;
        imageUrl: string;
      }[];
    }[];
  } = await info.json();

  const stats = [
    { title: "Followers", value: userInfo.counts.followers.toString() },
    { title: "Following", value: userInfo.counts.following.toString() },
    { title: "Total Orders", value: userInfo.counts.orders.toString() },
  ];

  return (
    <main className="min-h-screen bg-background pb-8">
      <div className="h-32 md:h-64 bg-linear-to-r from-primary/10 to-primary/5"></div>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto -mt-16 md:-mt-32 relative z-10">
          <section className="bg-card border border-border rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
              <div className="flex justify-center md:justify-start shrink-0">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-4 border-background shadow-md">
                  <Image
                    src={
                      user?.image ??
                      "https://api.dicebear.com/9.x/lorelei-neutral/svg?seed=Felix"
                    }
                    alt={user?.name || "User Avatar"}
                    className="w-full h-full object-cover"
                    height={160}
                    width={160}
                    fetchPriority="high"
                    unoptimized
                  />
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-between relative">
                <Badge
                  variant={user?.banned ? "destructive" : "success"}
                  className="top-3 right-3 absolute"
                >
                  {user?.banned ? "Banned" : "Active"}
                </Badge>
                <div className="space-y-3">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                      {user?.name || "User"}{" "}
                      {user?.role === "admin"
                        ? "(Admin)"
                        : user?.role === "manager"
                          ? "(Manager)"
                          : ""}
                    </h1>
                    <p className="text-base md:text-lg text-muted-foreground mt-1">
                      {user?.email}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border">
                    <CalendarDaysIcon className="w-4 h-4" />
                    <span>
                      Member since{" "}
                      {new Date(user?.createdAt || "").toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                        },
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 justify-between items-center">
                  <Button variant="outline" className="gap-2">
                    <MessageSquareIcon className="w-4 h-4" />
                    Message
                  </Button>
                  <div className="flex gap-2">
                    <Impersonate data={user} />
                    <ChangeRole data={user} />
                    <Ban banned={!!user?.banned} id={id} />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant={"ghost"} size={"icon"}>
                          <MoreVerticalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="bottom" align="end">
                        <DropdownMenuItem variant="destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
            {user?.banned && (
              <div className="mt-4">
                <div className="relative overflow-hidden rounded-lg border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20">
                  <div className="absolute inset-y-0 left-0 w-1 bg-linear-to-b from-red-400 to-red-600" />
                  <div className="p-4 pl-5">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
                        <ShieldBanIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-red-700 dark:text-red-400 leading-none">
                          Account Suspended
                        </p>
                        <p className="text-xs text-red-500/80 dark:text-red-500 mt-0.5">
                          This user has been banned from the platform
                        </p>
                      </div>
                    </div>
                    <div className="h-px bg-red-200 dark:bg-red-900/50 mb-3" />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-md bg-red-100/60 dark:bg-red-900/20 px-3 py-2">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-red-400 dark:text-red-500 mb-0.5">
                          Reason
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                          {user?.banReason || "No reason provided"}
                        </p>
                      </div>
                      <div className="rounded-md bg-red-100/60 dark:bg-red-900/20 px-3 py-2">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-red-400 dark:text-red-500 mb-0.5">
                          Banned Until
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                          {user?.banExpires
                            ? new Date(user.banExpires).toLocaleString()
                            : "Permanent"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
          <section className="w-full mt-8 grid md:grid-cols-3 gap-8">
            {stats.map((stat) => (
              <Card
                key={stat.title}
                className="border-0! ring-0 shadow-none bg-muted"
              >
                <CardHeader>
                  <CardTitle className="text-center text-xl uppercase font-semibold text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <CardContent
                    className={`text-4xl text-center mt-4 font-bold`}
                  >
                    {stat.value}
                  </CardContent>
                </CardHeader>
              </Card>
            ))}
          </section>
          <div className="h-12 w-full mt-8">
            <Tabs defaultValue="wishlist" className="w-full">
              <TabsList>
                <TabsTrigger value="wishlist">Wish List</TabsTrigger>
                <TabsTrigger value="recent">Recent Orders</TabsTrigger>
              </TabsList>
              <TabsContent value="wishlist">
                <Saved data={userInfo.wishlist} />
              </TabsContent>
              <TabsContent value="recent">
                <RecentOrders data={userInfo.recentOrders} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </main>
  );
}
