"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore, formatMoney, type CartLineItem } from "@/hooks/use-cart-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  MinusIcon,
  PlusIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  TagIcon,
  Trash2Icon,
  TruckIcon,
  XIcon,
} from "lucide-react";
import { sileo } from "sileo";

function EmptyCart() {
  return (
    <main className="flex min-h-[70dvh] flex-col items-center justify-center gap-6 p-8">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
        <ShoppingCartIcon className="size-12 text-muted-foreground" />
      </div>
      <div className="text-center space-y-2 max-w-xs">
        <h2 className="text-xl font-semibold">Your cart is empty</h2>
        <p className="text-sm text-muted-foreground">
          Looks like you haven't added anything yet. Browse our products to get started.
        </p>
      </div>
      <Button asChild size="lg" className="gap-2">
        <Link href="/">
          <ShoppingBagIcon className="size-4" />
          Browse Products
        </Link>
      </Button>
    </main>
  );
}

function CartItemRow({ item }: { item: CartLineItem }) {
  const { updateQuantity, removeItem } = useCartStore();
  const image = item.selection.images?.[0] ?? null;
  const hasDiscount =
    item.compareAtPrice !== null &&
    item.compareAtPrice !== undefined &&
    item.compareAtPrice > item.unitPrice;

  const handleRemove = () => {
    removeItem(item.id);
    sileo.success({
      title: "Item removed",
      description: `${item.productTitle} removed from cart`,
    });
  };

  return (
    <div className="group flex gap-4 py-5">
      {/* Image */}
      <Link
        href={`/product/${item.productSlug}`}
        className="h-24 w-24 shrink-0 overflow-hidden rounded-3xl border bg-muted transition-opacity hover:opacity-80"
      >
        {image ? (
          <Image
            src={image}
            alt={item.productTitle}
            width={96}
            height={96}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ShoppingCartIcon className="size-6 text-muted-foreground" />
          </div>
        )}
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/product/${item.productSlug}`}
              className="text-sm font-medium hover:text-primary transition-colors line-clamp-2 leading-snug"
            >
              {item.productTitle}
            </Link>
            {item.selection.title && (
              <p className="text-xs text-muted-foreground mt-0.5">{item.selection.title}</p>
            )}
            {item.selection.sku && (
              <p className="text-xs text-muted-foreground">SKU: {item.selection.sku}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
            onClick={handleRemove}
            aria-label="Remove item"
          >
            <XIcon className="size-3.5" />
          </Button>
        </div>

        <div className="flex items-center justify-between mt-auto pt-2">
          {/* Qty stepper */}
          <div className="flex items-center gap-1 rounded-full border bg-background px-1 py-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              aria-label="Decrease quantity"
            >
              <MinusIcon className="size-3" />
            </Button>
            <span className="w-7 text-center text-sm font-medium tabular-nums select-none">
              {item.quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              disabled={item.quantity >= item.selection.stockQuantity}
              aria-label="Increase quantity"
            >
              <PlusIcon className="size-3" />
            </Button>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="text-sm font-semibold tabular-nums">{formatMoney(item.lineTotal)}</p>
            {hasDiscount && (
              <p className="text-xs text-muted-foreground line-through tabular-nums">
                {formatMoney((item.compareAtPrice as number) * item.quantity)}
              </p>
            )}
            {item.quantity > 1 && (
              <p className="text-xs text-muted-foreground">
                {formatMoney(item.unitPrice)} each
              </p>
            )}
          </div>
        </div>

        {item.quantity >= item.selection.stockQuantity && (
          <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium mt-1">
            Max stock reached
          </p>
        )}
      </div>
    </div>
  );
}

function OrderSummaryPanel() {
  const { items, subtotal, compareAtSubtotal, itemCount } = useCartStore();

  const savings = compareAtSubtotal - subtotal;
  const hasSavings = savings > 0.01;
  const total = subtotal;

  return (
    <Card className="sticky top-28">
      <CardHeader className="border-b pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShoppingBagIcon className="size-4 text-primary" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5 space-y-4">
        {/* Line items breakdown */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})</span>
            <span className="tabular-nums">{formatMoney(subtotal)}</span>
          </div>
          {hasSavings && (
            <div className="flex justify-between text-green-600 dark:text-green-400">
              <span className="flex items-center gap-1">
                <TagIcon className="size-3" />
                Savings
              </span>
              <span className="tabular-nums font-medium">−{formatMoney(savings)}</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>Shipping</span>
            <span className="text-green-600 dark:text-green-400 font-medium">Free</span>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between font-semibold text-base">
          <span>Total</span>
          <span className="tabular-nums">{formatMoney(total)}</span>
        </div>

        <Button asChild className="w-full gap-2" size="lg">
          <Link href="/checkout">
            Proceed to Checkout
            <ArrowRightIcon className="size-4" />
          </Link>
        </Button>

        <Button asChild variant="outline" className="w-full" size="sm">
          <Link href="/">
            <ArrowLeftIcon className="size-3.5" />
            Continue Shopping
          </Link>
        </Button>

        {/* Trust badges */}
        <div className="pt-1 space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TruckIcon className="size-3.5 shrink-0" />
            Free standard shipping on all orders
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CartClient() {
  const { items, clearCart } = useCartStore();

  if (items.length === 0) return <EmptyCart />;

  const handleClear = () => {
    clearCart();
    sileo.success({ title: "Cart cleared", description: "All items removed" });
  };

  return (
    <main className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeftIcon className="size-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Your Cart</h1>
              <p className="text-sm text-muted-foreground">
                {items.length} item{items.length !== 1 ? "s" : ""} in your cart
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive gap-1.5 hidden sm:flex"
            onClick={handleClear}
          >
            <Trash2Icon className="size-3.5" />
            Clear cart
          </Button>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          {/* Items list */}
          <div className="lg:col-span-3 space-y-0">
            <Card>
              <CardContent className="px-6 py-0 divide-y">
                {items.map((item) => (
                  <CartItemRow key={item.id} item={item} />
                ))}
              </CardContent>
            </Card>

            {/* Mobile clear */}
            <div className="flex sm:hidden justify-end pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive gap-1.5"
                onClick={handleClear}
              >
                <Trash2Icon className="size-3.5" />
                Clear cart
              </Button>
            </div>

            {/* Mobile checkout CTA */}
            <div className="lg:hidden mt-4">
              <Button asChild className="w-full gap-2" size="lg">
                <Link href="/checkout">
                  Proceed to Checkout
                  <ArrowRightIcon className="size-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-2 hidden lg:block">
            <OrderSummaryPanel />
          </div>
        </div>
      </div>
    </main>
  );
}
