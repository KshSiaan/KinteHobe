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
        </div>
      </div>
    </div>
  );
}
