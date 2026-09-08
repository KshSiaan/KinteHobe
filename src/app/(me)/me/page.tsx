import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import {
  CalendarDaysIcon,
  EditIcon,
  MessageSquareIcon,
  MoreVerticalIcon,
} from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import Saved from "./_me/saved";
import Link from "next/link";
import Recent from "./_me/recent";
import { getOrders } from "@/lib/backend/order-queries";

export default async function Page() {
  const data = await auth?.api?.getSession({
    headers: await headers(),
  });
  const user = data?.user;
  const userId = user?.id ?? "";

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

              {/* User info */}
              <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                      {user?.name || "User"}
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
                <div className="flex flex-wrap gap-2 pt-4">
                  <Button className="gap-2" asChild>
                    <Link href="/me/settings">
                      <EditIcon className="w-4 h-4" />
                      Edit Profile
                    </Link>
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <MessageSquareIcon className="w-4 h-4" />
                    Message
                  </Button>
                  <Button variant="outline" size="icon">
                    <MoreVerticalIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </section>
          {userId && (
            <section className="mt-8 w-full space-y-6">
              <Saved />
            </section>
          )}
          {userId && (
            <section className="mt-8 w-full space-y-6">
              <Recent />
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
