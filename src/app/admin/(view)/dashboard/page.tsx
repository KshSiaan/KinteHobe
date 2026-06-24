"use client";

import AreaChart, { Area } from "@/components/charts/area-chart";
import Grid from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip/chart-tooltip";
import XAxis from "@/components/charts/x-axis";
import { RevenueGoalCard } from "@/components/dashboard/revenue-goal-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

type MonthlySalesPoint = {
  date: string;
  label: string;
  revenue: number;
  orderCount: number;
};

type TopCustomer = {
  id: string;
  name: string;
  image: string | null;
  totalSpentCents: number;
};

type TopProduct = {
  productId: string;
  productTitle: string;
  variantTitle: string | null;
  imageUrl: string | null;
  unitsSold: number;
  revenueCents: number;
} | null;

type AdminDashboardData = {
  kpis: {
    totalUsers: number;
    revenueTodayCents: number;
    inventoryCount: number;
    revenueMonthCents: number;
  };
  monthlySales: MonthlySalesPoint[];
  topCustomers: TopCustomer[];
  topProduct: TopProduct;
};

function formatUSD(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const RANK_LABEL = ["Top Buyer", "2nd", "3rd"];
const RANK_BADGE_CLASS = [
  "bg-amber-100 text-amber-700 font-medium",
  "bg-slate-100 text-slate-700",
  "bg-slate-100 text-slate-700",
];

export default function Page() {
  const { data, isPending } = useQuery<AdminDashboardData>({
    queryKey: ["admin-dashboard"],
    queryFn: () => fetch("/api/admin/dashboard").then((r) => r.json()),
    refetchInterval: 60_000,
  });

  const [chartMonths, setChartMonths] = useState(12);

  const chartData = useMemo(() => {
    return (data?.monthlySales ?? [])
      .slice(-chartMonths)
      .map((p) => ({ ...p, date: new Date(p.date) }));
  }, [data?.monthlySales, chartMonths]);

  const kpis = data?.kpis;
  const top3 = data?.topCustomers ?? [];
  // Podium visual order: 3rd (left), 1st (center), 2nd (right)
  const podium = [top3[2], top3[0], top3[1]];
  const topProduct = data?.topProduct ?? null;

  return (
    <div className="p-3 sm:p-6 flex flex-col flex-1 h-full w-full">
      <div className="flex flex-col gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
      </div>
      <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-7 gap-6 mt-6">
        {/* ── left col ── */}
        <div className="col-span-1 lg:col-span-4 flex flex-col gap-6 h-full">
          {/* KPI strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Users</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold">
                {isPending ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  kpis?.totalUsers.toLocaleString() ?? "—"
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Sales Today</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold">
                {isPending ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  formatUSD(kpis?.revenueTodayCents ?? 0)
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Inventory</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold">
                {isPending ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  kpis?.inventoryCount.toLocaleString() ?? "—"
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Sales (Month)</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold">
                {isPending ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  formatUSD(kpis?.revenueMonthCents ?? 0)
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sale Performance chart */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <CardTitle className="text-sm sm:text-base">Sale Performance</CardTitle>
              <Select
                value={String(chartMonths)}
                onValueChange={(v) => setChartMonths(Number(v))}
              >
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">Last 12 Months</SelectItem>
                  <SelectItem value="6">Last 6 Months</SelectItem>
                  <SelectItem value="3">Last 3 Months</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="h-56 w-full">
              {isPending || chartData.length === 0 ? (
                <Skeleton className="h-full w-full rounded-lg" />
              ) : (
                <AreaChart className="h-full w-full" data={chartData} xDataKey="date">
                  <Grid horizontal />
                  <Area dataKey="revenue" fill="var(--chart-2)" fillOpacity={0.4} />
                  <XAxis />
                  <ChartTooltip />
                </AreaChart>
              )}
            </CardContent>
          </Card>

          {/* Top Customers podium */}
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Top Customers</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-around px-2 py-4">
              {isPending ? (
                <>
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <Skeleton className="h-28 w-28 rounded-full" />
                  <Skeleton className="h-20 w-20 rounded-full" />
                </>
              ) : top3.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center">No customer sales data yet.</p>
              ) : (
                <>
                  {/* 3rd (left) */}
                  <div className="flex flex-col items-center gap-2">
                    {podium[0] ? (
                      <>
                        <Avatar className="size-16 sm:size-20 md:size-28">
                          <AvatarImage src={podium[0].image ?? undefined} />
                          <AvatarFallback>{getInitials(podium[0].name)}</AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                          <p className="text-xs font-semibold truncate max-w-20">{podium[0].name}</p>
                          <p className="text-xs text-muted-foreground">{formatUSD(podium[0].totalSpentCents)}</p>
                          <span className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${RANK_BADGE_CLASS[2]}`}>3rd</span>
                        </div>
                      </>
                    ) : (
                      <div className="size-16 sm:size-20 rounded-full bg-muted" />
                    )}
                  </div>

                  {/* 1st (center, larger) */}
                  <div className="flex flex-col items-center gap-2 -mt-6">
                    <div className="relative">
                      <span className="text-3xl sm:text-5xl absolute -top-6 sm:-top-9 -right-3 sm:-right-4 rotate-30">
                        👑
                      </span>
                      <Avatar className="size-20 sm:size-28 md:size-36">
                        <AvatarImage src={podium[1]?.image ?? undefined} />
                        <AvatarFallback>{podium[1] ? getInitials(podium[1].name) : "—"}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="text-center">
                      <p className="text-xs sm:text-sm font-bold truncate max-w-25">{podium[1]?.name ?? "—"}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground font-semibold">
                        {podium[1] ? formatUSD(podium[1].totalSpentCents) : "—"}
                      </p>
                      <span className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${RANK_BADGE_CLASS[0]}`}>
                        {RANK_LABEL[0]}
                      </span>
                    </div>
                  </div>

                  {/* 2nd (right) */}
                  <div className="flex flex-col items-center gap-2">
                    {podium[2] ? (
                      <>
                        <Avatar className="size-16 sm:size-20 md:size-28">
                          <AvatarImage src={podium[2].image ?? undefined} />
                          <AvatarFallback>{getInitials(podium[2].name)}</AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                          <p className="text-xs font-semibold truncate max-w-20">{podium[2].name}</p>
                          <p className="text-xs text-muted-foreground">{formatUSD(podium[2].totalSpentCents)}</p>
                          <span className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${RANK_BADGE_CLASS[1]}`}>2nd</span>
                        </div>
                      </>
                    ) : (
                      <div className="size-16 sm:size-20 rounded-full bg-muted" />
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── right col ── */}
        <div className="col-span-1 lg:col-span-3 flex flex-col gap-6 h-full">
          <RevenueGoalCard canEdit={true} />

          {/* Most Sold Product */}
          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Most Sold Product</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-3 overflow-hidden">
              {isPending ? (
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-32 w-full rounded-lg" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="grid grid-cols-2 gap-2">
                    <Skeleton className="h-14 rounded" />
                    <Skeleton className="h-14 rounded" />
                  </div>
                </div>
              ) : topProduct === null ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                  <p className="text-sm text-muted-foreground">No product sales data yet.</p>
                </div>
              ) : (
                <>
                  {topProduct.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={topProduct.imageUrl}
                      alt={topProduct.productTitle}
                      className="w-full h-32 object-cover rounded-lg shrink-0"
                    />
                  ) : (
                    <div className="w-full h-32 bg-linear-to-br from-purple-200 to-blue-200 rounded-lg flex items-center justify-center shrink-0">
                      <div className="text-5xl">📦</div>
                    </div>
                  )}

                  <div className="space-y-1 shrink-0">
                    <h3 className="text-sm font-bold line-clamp-2">{topProduct.productTitle}</h3>
                    {topProduct.variantTitle && (
                      <p className="text-xs text-muted-foreground">{topProduct.variantTitle}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 shrink-0">
                    <div className="bg-muted p-2 rounded">
                      <p className="text-xs text-muted-foreground">Units Sold</p>
                      <p className="text-lg font-bold">{topProduct.unitsSold.toLocaleString()}</p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="text-xs text-muted-foreground">Revenue</p>
                      <p className="text-lg font-bold">{formatUSD(topProduct.revenueCents)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-auto pt-2 shrink-0">
                    <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                      Top Seller
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
