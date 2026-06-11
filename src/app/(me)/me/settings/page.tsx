import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import General from "./general";
import Security from "./security";
import Shopping from "./shopping";
import Organization from "./organization";
import Restricted from "./restricted";

export default function Page() {
  return (
    <section className="p-8">
      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="shopping">Shopping</TabsTrigger>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="restricted">Restricted Zone</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <General />
        </TabsContent>
        <TabsContent value="security">
          <Security />
        </TabsContent>
        <TabsContent value="shopping">
          <Shopping />
        </TabsContent>
        <TabsContent value="organizations">
          <Organization />
        </TabsContent>
        <TabsContent value="restricted">
          <Restricted />
        </TabsContent>
      </Tabs>
    </section>
  );
}
