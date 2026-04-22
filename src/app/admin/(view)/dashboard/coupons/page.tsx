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
    <div className="p-6">
      <div className="flex items-center justify-between">
        <Tabs className="w-full">
          <div className="flex justify-between items-center w-full mb-3">
            <TabsList className="">
              <TabsTrigger value="1">Global Coupons</TabsTrigger>
              <TabsTrigger value="2">Product Specific Coupons</TabsTrigger>
              <TabsTrigger value="3">Redeem History</TabsTrigger>
            </TabsList>
            <Button className="">
              <PencilIcon />
              Create Coupon
            </Button>
          </div>
          <TabsContent value="1">
            <Card>
              <CardHeader className="flex justify-between items-center">
                <InputGroup>
                  <InputGroupAddon>
                    <SearchIcon />
                  </InputGroupAddon>
                  <InputGroupInput placeholder="Search by code or Id" />
                </InputGroup>
                <div className="flex gap-2 items-center">
                  <Input />
                  <Input />
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="latest">Latest</SelectItem>
                      <SelectItem value="earliest">Earliest</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Switch id="expired" />{" "}
                    <Label htmlFor="expired" className="whitespace-nowrap">
                      Show Expired
                    </Label>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </TabsContent>
          <TabsContent value="2"></TabsContent>
          <TabsContent value="3"></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
