import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PencilIcon, SearchIcon } from "lucide-react";
import React from "react";

export default function Page() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Coupon Management</h1>
        <p className="text-muted-foreground">
          Create, manage, and track coupon codes for your products
        </p>
      </div>

      {/* Tabs & Create Button */}
      <Tabs className="w-full" defaultValue="1">
        <div className="flex items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="1">Global Coupons</TabsTrigger>
            <TabsTrigger value="2">Product Specific</TabsTrigger>
            <TabsTrigger value="3">Redeem History</TabsTrigger>
          </TabsList>
          <Button>
            <PencilIcon />
            Create Coupon
          </Button>
        </div>

        {/* Global Coupons Tab */}
        <TabsContent value="1" className="space-y-4 mt-2">
          {/* Search Bar */}
          <InputGroup className="bg-background">
            <InputGroupAddon>
              <SearchIcon className="text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput placeholder="Search by code or ID" />
          </InputGroup>

          {/* Filter Bar */}
          <div className="flex flex-wrap gap-3 rounded-lg border bg-card p-4">
            {/* From Date */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="from-date" className="text-xs font-medium">
                From
              </Label>
              <Input id="from-date" type="date" className="h-9 w-40" />
            </div>

            {/* Until Date */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="until-date" className="text-xs font-medium">
                Until
              </Label>
              <Input id="until-date" type="date" className="h-9 w-40" />
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="status" className="text-xs font-medium">
                Status
              </Label>
              <Select>
                <SelectTrigger id="status" className="h-9 w-44">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Show Expired - Positioned to the right */}
            <div className="ml-auto flex items-center gap-2 pb-1">
              <Switch id="show-expired" />
              <Label htmlFor="show-expired" className="text-sm font-medium">
                Expired
              </Label>
            </div>
          </div>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Coupons</h2>
            </CardHeader>
            <div className="border-t px-6 py-4">
              <p className="text-center text-sm text-muted-foreground">
                No coupons yet. Create one to get started.
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* Product Specific Tab */}
        <TabsContent value="2" className="space-y-4">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">
                Product Specific Coupons
              </h2>
            </CardHeader>
            <div className="border-t px-6 py-4">
              <p className="text-center text-sm text-muted-foreground">
                No product-specific coupons yet.
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* Redeem History Tab */}
        <TabsContent value="3" className="space-y-4">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Redeem History</h2>
            </CardHeader>
            <div className="border-t px-6 py-4">
              <p className="text-center text-sm text-muted-foreground">
                No redemption history yet.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
