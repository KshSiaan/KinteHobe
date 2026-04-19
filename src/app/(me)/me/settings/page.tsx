import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";

export default function Page() {
  return (
    <section className="p-8">
      <Tabs>
        <TabsList>
          <TabsTrigger value="1">General</TabsTrigger>
          <TabsTrigger value="2">Security</TabsTrigger>
          <TabsTrigger value="3">Shopping</TabsTrigger>
          <TabsTrigger value="4">Organizations</TabsTrigger>
          <TabsTrigger value="5">Restricted Zone</TabsTrigger>
        </TabsList>
        <TabsContent value="1"></TabsContent>
      </Tabs>
    </section>
  );
}
