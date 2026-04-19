import UnderlineTabs from "@/components/shadcn-studio/tabs/tabs-29";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import {
  CalendarDaysIcon,
  EditIcon,
  MessageSquareIcon,
  MoreVerticalIcon,
} from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import Activity from "./activity";

export default async function Page() {
  const data = await auth?.api?.getSession({
    headers: await headers(),
  });
  const user = data?.user;

  const stats = [
    { title: "Followers", value: "4.5k" },
    { title: "Following", value: "4.5k" },
    { title: "My Orders", value: "46" },
    { title: "Balance", value: "4.5k", isBalance: true },
  ];

  return (
    <main className="min-h-screen bg-background pb-8">
      {/* Header background accent */}
      <div className="h-32 md:h-48 bg-gradient-to-r from-primary/10 to-primary/5"></div>

      <div className="px-4 sm:px-6 lg:px-8">
        {/* Profile card - overlaps header */}
        <div className="max-w-7xl mx-auto -mt-16 md:-mt-20 relative z-10">
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
                  <Button className="gap-2">
                    <EditIcon className="w-4 h-4" />
                    Edit Profile
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
          <section className="mt-8 w-full">
            <UnderlineTabs
              tabs={[
                {
                  name: "Activity",
                  value: "activity",
                  content: <Activity />,
                },
              ]}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
