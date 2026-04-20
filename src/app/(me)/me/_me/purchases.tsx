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
import { ArrowRight, MedalIcon, Star, StarIcon } from "lucide-react";
import Image from "next/image";
import React from "react";

export default function Purchases() {
  return (
    <div className="w-full gap-4">
      <Card>
        <CardContent className="flex items-center justify-between gap-3">
          {/* Left: Image & Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Image
              src={"/img/prod1.jpg"}
              alt="Product Image"
              height={400}
              width={400}
              priority
              className="size-16 rounded-md object-cover shadow-sm flex-shrink-0"
            />
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold truncate">Product Name</h3>
                <Badge variant={"success"} className="text-xs">
                  Delivered
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Order #12345 · $0.00
              </p>
              <p className="text-xs text-muted-foreground line-clamp-1">
                Qty: 1
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button size="sm" variant={"ghost"} className="h-8 px-2">
              <Star className="w-4 h-4" />
            </Button>
            <Button size="sm" variant={"outline"}>
              Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
