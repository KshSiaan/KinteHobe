import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import General from "./general";
import Security from "./security";

import Restricted from "./restricted";
import Appearance from "./appearance";
import Agent from "./agent";

export default function Page() {
  return (
    <section className="p-8">
      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="agent">Agent</TabsTrigger>
          <TabsTrigger value="restricted">Restricted Zone</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <General />
        </TabsContent>
        <TabsContent value="security">
          <Security />
        </TabsContent>
        <TabsContent value="appearance">
          <Appearance />
        </TabsContent>
        <TabsContent value="agent">
          <Agent />
        </TabsContent>
        <TabsContent value="restricted">
          <Restricted />
        </TabsContent>
      </Tabs>
    </section>
  );
}
