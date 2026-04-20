import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import Link from "next/link";
import React from "react";

export default function Saved() {
  return (
    <div className="grid grid-cols-4 w-full">
      {Array.from({ length: 7 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        <Link href={"#"} key={i}>
          <Card className="p-0! aspect-square flex flex-col transition-transform relative rounded-none shadow-none border-dashed overflow-visible">
            <CardHeader className="w-full aspect-video  rounded-none"></CardHeader>
            <CardContent>
              <h4 className="text-base font-bold">Card Title</h4>
              <p className="line-clamp-2">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Iure
                recusandae impedit sit, quo velit hic, optio numquam magni ex
                incidunt nesciunt iusto animi quibusdam eaque ea voluptates
                itaque, temporibus ullam?
              </p>
            </CardContent>
            <CardFooter className="flex-1 w-full flex justify-start items-center pb-6 gap-2">
              <p className="text-lg font-semibold">400/-</p>
              <p className="text-destructive opacity-70 line-through">599/-</p>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}
