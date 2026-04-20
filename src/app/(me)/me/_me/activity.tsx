import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, MedalIcon, StarIcon } from "lucide-react";
import React from "react";

export default function Activity() {
  return (
    <div className="w-full grid grid-cols-7 gap-4">
      <Card className="w-full col-span-4 h-full flex flex-col pt-0 gap-0">
        <CardHeader
          className="w-full flex-1 relative pt-6 bg-cover bg-center "
          style={{
            backgroundImage: `url('/img/prod1.jpg')`,
          }}
        >
          <Badge className="">⭐ New arrivals</Badge>
        </CardHeader>
        <CardFooter className="border-t flex items-center justify-between">
          <div className="">
            <AvatarGroup>
              {[
                "https://api.dicebear.com/9.x/dylan/svg?seed=Amaya",
                "https://api.dicebear.com/9.x/adventurer/svg?seed=Avery",
                "https://api.dicebear.com/9.x/lorelei-neutral/svg?seed=Eden",
              ].map((src, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                <Avatar key={index} className="w-8 h-8">
                  <AvatarImage src={src} alt={`Avatar ${index + 1}`} />
                  <AvatarFallback>{`A${index + 1}`}</AvatarFallback>
                </Avatar>
              ))}
              <AvatarGroupCount className="text-xs">+57</AvatarGroupCount>
            </AvatarGroup>
          </div>
          <Button>
            View Order <ArrowRight />
          </Button>
        </CardFooter>
      </Card>
      <div className="col-span-3 space-y-4">
        <div className="w-full bg-accent p-8 rounded-2xl space-y-4 border border-border shadow-md">
          <div className="p-4 bg-background text-primary rounded-full w-min">
            <MedalIcon />
          </div>
          <h2 className="text-2xl font-semibold">Platinum Status</h2>
          <p>
            You're in the top 1% of curator this month! <br /> Keep it up!
          </p>
          <div className="">
            <Progress max={100} value={75} />
            <div className="w-full flex justify-between items-center mt-2">
              <p>2,500 XP</p>
              <p>3,000 XP</p>
            </div>
          </div>
        </div>
        <Card className="bg-secondary">
          <CardHeader>
            <CardTitle className="text-xl">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4 text-base">
            <div className="flex justify-between items-center">
              <span>Avg. Order Value</span>
              <span>$125.00</span>
            </div>
            <div className="flex justify-between items-center">
              <span> Review Rating</span>
              <span className="flex items-center-safe space-x-2">
                4.8/5 <StarIcon className="text-primary size-3 ml-2" />
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Total Feedback</span>
              <span>1,250</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
