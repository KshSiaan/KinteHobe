import AreaChart, { Area } from "@/components/charts/area-chart";
import Grid from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip/chart-tooltip";
import XAxis from "@/components/charts/x-axis";
import { Gauge } from "@/components/gauge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
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
import React from "react";

// Last 12 months vendor data - 3 vendors with realistic volatile performance
const monthlyVendorData = [
  {
    date: new Date("2025-01-01"),
    month: "Jan",
    vendor1: 6200,
    vendor2: 4100,
    vendor3: 2400,
  },
  {
    date: new Date("2025-02-01"),
    month: "Feb",
    vendor1: 4800,
    vendor2: 3200,
    vendor3: 3100,
  },
  {
    date: new Date("2025-03-01"),
    month: "Mar",
    vendor1: 7100,
    vendor2: 5300,
    vendor3: 2800,
  },
  {
    date: new Date("2025-04-01"),
    month: "Apr",
    vendor1: 5400,
    vendor2: 3800,
    vendor3: 3600,
  },
  {
    date: new Date("2025-05-01"),
    month: "May",
    vendor1: 6800,
    vendor2: 4600,
    vendor3: 2900,
  },
  {
    date: new Date("2025-06-01"),
    month: "Jun",
    vendor1: 5200,
    vendor2: 5100,
    vendor3: 4200,
  },
  {
    date: new Date("2025-07-01"),
    month: "Jul",
    vendor1: 7400,
    vendor2: 3900,
    vendor3: 3100,
  },
  {
    date: new Date("2025-08-01"),
    month: "Aug",
    vendor1: 4900,
    vendor2: 6200,
    vendor3: 3800,
  },
  {
    date: new Date("2025-09-01"),
    month: "Sep",
    vendor1: 7600,
    vendor2: 4100,
    vendor3: 2600,
  },
  {
    date: new Date("2025-10-01"),
    month: "Oct",
    vendor1: 5800,
    vendor2: 5900,
    vendor3: 3900,
  },
  {
    date: new Date("2025-11-01"),
    month: "Nov",
    vendor1: 6500,
    vendor2: 3600,
    vendor3: 4300,
  },
  {
    date: new Date("2025-12-01"),
    month: "Dec",
    vendor1: 7900,
    vendor2: 5400,
    vendor3: 3200,
  },
];

export default function Page() {
  return (
    <div className="p-6 flex flex-col flex-1 h-full w-full">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
      <div className="flex-1 w-full grid grid-cols-7 gap-6 mt-6">
        <div className="col-span-4 flex flex-col gap-6 h-full">
          <div className="grid grid-cols-4 gap-6">
            <Card className="">
              <CardHeader>
                <CardTitle>Total Users</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold">1,234</CardContent>
            </Card>
            <Card className="">
              <CardHeader>
                <CardTitle>Total Sales (Today)</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold">1,234</CardContent>
            </Card>
            <Card className="">
              <CardHeader>
                <CardTitle>Inventory count</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold">1,234</CardContent>
            </Card>
            <Card className="">
              <CardHeader>
                <CardTitle>Total Sales (Month)</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold">1,234</CardContent>
            </Card>
          </div>
          <Card className="">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Vendor Performance (Last 12 Months)</CardTitle>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Last 12 Months</SelectItem>
                  <SelectItem value="2">Last 6 Months</SelectItem>
                  <SelectItem value="3">Last 3 Months</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="h-56 w-full">
              <AreaChart
                className="h-full w-full"
                data={monthlyVendorData}
                xDataKey="date"
              >
                <Grid horizontal />
                <Area
                  dataKey="vendor1"
                  fill="var(--chart-2)"
                  fillOpacity={0.4}
                />
                <Area
                  dataKey="vendor2"
                  fill="var(--chart-4)"
                  fillOpacity={0.4}
                />
                <Area
                  dataKey="vendor3"
                  fill="var(--chart-3)"
                  fillOpacity={0.4}
                />

                <XAxis />
                <ChartTooltip />
              </AreaChart>
            </CardContent>
          </Card>
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Top Customers</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-around px-2">
              {/* Third Place */}
              <div className="flex flex-col items-center gap-2">
                <Avatar className="size-28">
                  <AvatarImage
                    src={
                      "https://api.dicebear.com/9.x/notionists/svg?backgroundColor=d1d4f9&seed=Avery"
                    }
                  />
                  <AvatarFallback>AV</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <p className="text-xs font-semibold">Avery Chen</p>
                  <p className="text-xs text-muted-foreground">$8,450</p>
                  <span className="inline-block text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full mt-1">
                    3rd
                  </span>
                </div>
              </div>

              {/* First Place - Center, Larger */}
              <div className="flex flex-col items-center gap-2 -mt-6">
                <div className="relative">
                  <span className="text-5xl absolute -top-9 -right-4 rotate-30">
                    👑
                  </span>
                  <Avatar className="size-36">
                    <AvatarImage
                      src={
                        "https://api.dicebear.com/9.x/notionists/svg?backgroundColor=d1d4f9&seed=Kingston"
                      }
                    />
                    <AvatarFallback>KG</AvatarFallback>
                  </Avatar>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold">Kingston Park</p>
                  <p className="text-sm text-muted-foreground font-semibold">
                    $24,890
                  </p>
                  <span className="inline-block text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full mt-1 font-medium">
                    Top Buyer
                  </span>
                </div>
              </div>

              {/* Second Place */}
              <div className="flex flex-col items-center gap-2">
                <Avatar className="size-28">
                  <AvatarImage
                    src={
                      "https://api.dicebear.com/9.x/notionists/svg?backgroundColor=d1d4f9&seed=Vivian"
                    }
                  />
                  <AvatarFallback>VV</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <p className="text-xs font-semibold">Vivian Blake</p>
                  <p className="text-xs text-muted-foreground">$12,340</p>
                  <span className="inline-block text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full mt-1">
                    2nd
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="col-span-3 flex flex-col gap-6 h-full">
          <Card className="">
            <CardHeader>
              <CardTitle className="text-lg">
                Total Revenue this month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-full w-full items-center justify-center">
                <Gauge
                  value={80}
                  size={200}
                  gaugeType="full"
                  tickMarks
                  accumulate="sum"
                  primary={{
                    0: "danger",
                    30: "warning",
                    70: "success",
                  }}
                  label="Revenue"
                  unit="USD"
                  max={100}
                />
              </div>
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-2">
              <div className="flex flex-col items-center">
                <p className="text-sm text-muted-foreground">Target</p>
                <p className="text-2xl font-bold">$10,000</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-sm text-muted-foreground">Current</p>
                <p className="text-2xl font-bold">$8,000</p>
              </div>
            </CardFooter>
          </Card>
          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Most Sold Product</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-3 overflow-hidden">
              {/* Product Image Placeholder */}
              <div className="w-full h-32 bg-gradient-to-br from-purple-200 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <div className="text-5xl">📦</div>
              </div>

              {/* Product Info */}
              <div className="space-y-1 flex-shrink-0">
                <h3 className="text-sm font-bold line-clamp-2">
                  Premium Wireless Headphones
                </h3>
                <p className="text-xs text-muted-foreground">Model: PWH-2024</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 flex-shrink-0">
                <div className="bg-muted p-2 rounded">
                  <p className="text-xs text-muted-foreground">Units Sold</p>
                  <p className="text-lg font-bold">1,240</p>
                </div>
                <div className="bg-muted p-2 rounded">
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <p className="text-lg font-bold">$62k</p>
                </div>
              </div>

              {/* Growth Indicator */}
              <div className="space-y-1 flex-shrink-0">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium">Growth</span>
                  <span className="text-xs font-bold text-green-600">+23%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-1.5 rounded-full"
                    style={{ width: "73%" }}
                  ></div>
                </div>
              </div>

              {/* Category Tag */}
              <div className="flex gap-2 mt-auto pt-2 flex-shrink-0">
                <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                  Electronics
                </span>
                <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                  Top Seller
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
