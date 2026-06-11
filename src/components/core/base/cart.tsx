"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCartStore } from "@/hooks/use-cart-store";
import { InboxIcon, ShoppingCartIcon } from "lucide-react";
import React from "react";

export default function Cart() {
  const data = useCartStore().items;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={"ghost"} size={"icon"}>
          <ShoppingCartIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-lg" align="end">
        <PopoverHeader className="border-b pb-2">
          <PopoverTitle className="text-sm ">Your Cart (0)</PopoverTitle>
          <PopoverDescription className="text-xs text-muted-foreground">
            You can review your cart and proceed to checkout when you're ready.
          </PopoverDescription>
        </PopoverHeader>
        <div className="max-h-[80dvh] overflow-y-auto p-4">
          {data.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <InboxIcon />
                </EmptyMedia>
                <EmptyTitle>Empty cart</EmptyTitle>
                <EmptyDescription>Add items to your cart</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="space-y-4">
              {data.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <img
                    src={item.image ?? "/placeholder.svg"}
                    alt={item.productTitle}
                    className="h-16 w-16 rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.productTitle}</h3>
                    <p className="text-sm text-muted-foreground">
                      ${item.lineTotal.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-bold">
                    ${(item.lineTotal * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
