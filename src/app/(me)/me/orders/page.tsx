import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star } from "lucide-react";
import Image from "next/image";
import React from "react";

export default function Page() {
  return (
    <section className="p-8">
      <h1 className="text-4xl font-semibold border-b">My orders </h1>
      <div className="mt-8">
        <Tabs>
          <TabsList>
            <TabsTrigger value="1">All</TabsTrigger>
            <TabsTrigger value="2">Pending</TabsTrigger>
            <TabsTrigger value="3">Delivered</TabsTrigger>
            <TabsTrigger value="4">Cancelled</TabsTrigger>
          </TabsList>
          <TabsContent value="1">
            <div className="w-full">
              <Card>
                <CardHeader className="flex justify-between items-center">
                  <Badge variant={"success"}>Delivered</Badge>
                  <Button variant={"link"}>
                    <Star /> Rate and review product
                  </Button>
                </CardHeader>
                <CardHeader className="flex justify-between items-center border-b">
                  <p className="text-sm text-muted-foreground">
                    Date || order no
                  </p>
                  <CardTitle>
                    total: <span className="text-2xl">$0.00</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="flex justify-start items-center gap-4">
                    <Image
                      src={"/img/prod1.jpg"}
                      alt="Product Image"
                      height={400}
                      width={400}
                      priority
                      className="size-25 rounded-lg object-cover shadow-md"
                    />
                    <div className="flex flex-col gap-1">
                      <h3 className="text-lg font-semibold">Product Name</h3>
                      <p className="text-muted-foreground line-clamp-1">
                        Description of the product.
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Quantity: 1
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Coupon used: None
                      </p>
                    </div>
                  </div>
                  <Button variant={"outline"}>Order Details</Button>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-muted-foreground">
                    Delivery address: 123 Main St, City, Country
                  </p>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="2">
            <div className="w-full">Content for Pending</div>
          </TabsContent>
          <TabsContent value="3">
            <div className="w-full">Content for Delivered</div>
          </TabsContent>
          <TabsContent value="4">
            <div className="w-full">Content for Cancelled</div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
