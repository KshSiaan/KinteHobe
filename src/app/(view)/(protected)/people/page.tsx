"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import Friends from "./friends";
import Requests from "./requests";
import Everyone from "./everyone";

export default function Page() {
  const [active, setActive] = React.useState("Everyone");
  const sections = [
    {
      title: "Friends",
      content: <Friends />,
    },
    {
      title: "Requests",
      content: <Requests />,
    },
    {
      title: "Everyone",
      content: <Everyone />,
    },
  ];
  return (
    <main className="p-6">
      <div className="grid grid-cols-5 gap-6 ">
        <Card>
          <CardContent className="flex gap-4 flex-col items-start justify-center">
            {sections.map((section, index) => (
              <Button
                variant={active === section.title ? "default" : "ghost"}
                className="w-full justify-start"
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                key={index}
                onClick={() => setActive(section.title)}
              >
                {section.title}
              </Button>
            ))}
          </CardContent>
        </Card>
        <Card className="col-span-4">
          <CardContent>
            <h2 className="text-xl font-bold">{active}</h2>
            {sections.find((section) => section.title === active)?.content}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
