"use client";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { formatMoney, useCartStore } from "@/hooks/use-cart-store";
import {
  ArrowRightIcon,
  InboxIcon,
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function Cart() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const items = useCartStore((s) => s.items);
  const itemCount = useCartStore((s) => s.itemCount);
  const subtotal = useCartStore((s) => s.subtotal);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  function navigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCartIcon />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-96" align="end">
        <PopoverHeader className="border-b pb-3">
          <PopoverTitle className="text-sm font-semibold">
            Your Cart ({itemCount})
          </PopoverTitle>
          <PopoverDescription className="text-xs text-muted-foreground">
            Review your cart and proceed to checkout when ready.
          </PopoverDescription>
        </PopoverHeader>

        {/* Items */}
        <div className="max-h-[55dvh] overflow-y-auto">
          {items.length === 0 ? (
            <div className="py-8">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <InboxIcon />
                  </EmptyMedia>
                  <EmptyTitle>Empty cart</EmptyTitle>
                  <EmptyDescription>Add items to get started</EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          ) : (
            <div className="divide-y px-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-start gap-3 py-3">
                  {/* Thumbnail — links to product */}
                  <button
                    type="button"
                    onClick={() => navigate(`/product/${item.productSlug}`)}
                    className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border bg-muted hover:opacity-80 transition-opacity"
                  >
                    {item.selection.images[0] ? (
                      <img
                        src={item.selection.images[0]}
                        alt={item.productTitle}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ShoppingCartIcon className="size-5 text-muted-foreground" />
                      </div>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => navigate(`/product/${item.productSlug}`)}
                      className="text-sm font-medium leading-snug line-clamp-2 text-left hover:text-primary transition-colors"
                    >
                      {item.productTitle}
                    </button>
                    {item.selection.optionLabel && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.selection.optionLabel}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      {/* Qty stepper */}
                      <div className="flex items-center gap-1 rounded-full border bg-background px-1 py-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-full"
                          disabled={item.quantity <= 1}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <MinusIcon className="size-2.5" />
                        </Button>
                        <span className="w-6 text-center text-xs font-medium tabular-nums select-none">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-full"
                          disabled={item.quantity >= item.selection.stockQuantity}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <PlusIcon className="size-2.5" />
                        </Button>
                      </div>
                      <p className="text-sm font-semibold tabular-nums">
                        {formatMoney(item.lineTotal)}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive mt-0.5"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2Icon className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t pt-3 px-4 pb-1 space-y-3">
            <div className="flex justify-between text-sm font-semibold">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatMoney(subtotal)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs gap-1"
                onClick={() => navigate("/cart")}
              >
                View all
                <ArrowRightIcon className="size-3" />
              </Button>
              <Button
                size="sm"
                className="w-full text-xs gap-1"
                onClick={() => navigate("/checkout")}
              >
                Checkout
                <ArrowRightIcon className="size-3" />
              </Button>
            </div>
          </div>
        )}

        {items.length === 0 && (
          <div className="px-4 pb-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => navigate("/")}
            >
              Browse Products
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
