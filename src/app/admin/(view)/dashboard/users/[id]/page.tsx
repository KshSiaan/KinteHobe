import UnderlineTabs from "@/components/shadcn-studio/tabs/tabs-29";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { auth } from "@/lib/auth";

import {
  AlertCircleIcon,
  CalendarDaysIcon,
  LogInIcon,
  MessageSquareIcon,
  MoreVerticalIcon,
  ShieldBanIcon,
} from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import Ban from "./ban";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Impersonate from "./impersonate";
import ChangeRole from "./changeRole";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await auth.api.getUser({
    headers: await headers(),
    query: {
      id,
    },
  });

  const stats = [
    { title: "Followers", value: "4.5k" },
    { title: "Following", value: "4.5k" },
    { title: "My Orders", value: "46" },
    { title: "Balance", value: "4.5k", isBalance: true },
  ];

  return (
    <main className="min-h-screen bg-background pb-8">
      {/* Header background accent */}
      <div className="h-32 md:h-64 bg-gradient-to-r from-primary/10 to-primary/5"></div>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Profile card - overlaps header */}
        <div className="mx-auto -mt-16 md:-mt-32 relative z-10">
          <section className="bg-card border border-border rounded-2xl p-6 md:p-8">
            {/* Avatar and info layout */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
              {/* Avatar */}
              <div className="flex justify-center md:justify-start flex-shrink-0">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-4 border-background shadow-md">
                  <Image
                    src={
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

              {/* User info */}
              <div className="flex-1 flex flex-col justify-between relative">
                <Badge
                  variant={"destructive"}
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

                  {/* Member since */}
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

                {/* Action buttons */}
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
                  {/* Accent bar */}
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-red-400 to-red-600" />

                  <div className="p-4 pl-5">
                    {/* Header */}
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

                    {/* Divider */}
                    <div className="h-px bg-red-200 dark:bg-red-900/50 mb-3" />

                    {/* Details */}
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
                          {user.banExpires
                            ? new Date(user?.banExpires).toLocaleString()
                            : "Permanent"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
          {/* Additional content section */}
          <section className="w-full mt-8 grid grid-cols-4 gap-8">
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
                    className={`text-4xl text-center mt-4 font-bold ${
                      stat.isBalance ? "text-primary" : ""
                    }`}
                  >
                    {stat.value}
                  </CardContent>
                </CardHeader>
              </Card>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
