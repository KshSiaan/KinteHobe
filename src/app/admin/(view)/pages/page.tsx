import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";

export default function Page() {
  return (
    <main className="flex-1 p-6">
      <h1 className="text-2xl font-bold">Legal Pages</h1>

      <Tabs>
        <TabsList>
          <TabsTrigger value="about">About Us</TabsTrigger>
          <TabsTrigger value="terms">Terms of Service</TabsTrigger>
          <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
          <TabsTrigger value="cookie">Cookie Policy</TabsTrigger>
        </TabsList>
      </Tabs>
    </main>
  );
}
