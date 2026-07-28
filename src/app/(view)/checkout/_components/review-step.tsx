"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useCartStore, formatMoney } from "@/hooks/use-cart-store";
import {
  ArrowLeftIcon,
  BanknoteIcon,
  ClockIcon,
  CreditCardIcon,
  LockIcon,
  MapPinIcon,
  PackageIcon,
  TruckIcon,
} from "lucide-react";
import type { ShippingForm } from "../types";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = {
  shipping: ShippingForm;
  onPlace: ({ type }: { type: "stripe" | "cash" }) => void;
  onBack: () => void;
  isLoading: boolean;
};

export function ReviewStep({ shipping, onPlace, onBack, isLoading }: Props) {
  const { subtotal } = useCartStore();
  const total = subtotal;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <PackageIcon className="size-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Review & Pay</h2>
          <p className="text-sm text-muted-foreground">
            Confirm your details, then pay securely via Stripe.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border bg-muted/30 p-5 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MapPinIcon className="size-4 text-muted-foreground" />
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Shipping To
            </p>
          </div>
          <p className="text-sm font-medium">{shipping.fullName}</p>
          <p className="text-sm text-muted-foreground">{shipping.address}</p>
          <p className="text-sm text-muted-foreground">
            {shipping.city}, {shipping.state} {shipping.zip}
          </p>
          <p className="text-sm text-muted-foreground">{shipping.country}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {shipping.email} · {shipping.phone}
          </p>
        </div>

        <Separator />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatMoney(subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Shipping</span>
            <span className="text-green-600 font-medium">Free</span>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between font-semibold text-base">
          <span>Total due</span>
          <span className="tabular-nums">{formatMoney(total)}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="flex-1"
        >
          <ArrowLeftIcon className="size-4" />
          Back
        </Button>
        <Button
          onClick={() => onPlace({ type: "stripe" })}
          disabled={isLoading}
          className="flex-[2] gap-2"
          variant="success"
        >
          {isLoading ? (
            <>
              <Spinner className="size-4" />
              Redirecting to Stripe...
            </>
          ) : (
            <>
              <CreditCardIcon className="size-4" />
              Pay with Stripe
            </>
          )}
        </Button>
      </div>
      <Button
        onClick={() => onPlace({ type: "cash" })}
        disabled={isLoading}
        className="w-full gap-2"
        variant="default"
      >
        {isLoading ? (
          <>
            <Spinner className="size-4" />
            Confirming order...
          </>
        ) : (
          <>
            <TruckIcon className="size-4" />
            Confirm Cash on Delivery
          </>
        )}
      </Button>
      {/* <div className="flex items-center gap-6">
        <div className="border-t flex-1"></div>
        <p className="text-sm text-muted-foreground text-center">or</p>
        <div className="border-t flex-1"></div>
      </div>
      <Button
        onClick={() => onPlace({ type: "cash" })}
        disabled={isLoading}
        className="w-full gap-2"
        variant="default"
      >
        {isLoading ? (
          <>
            <Spinner className="size-4" />
            Preparing payment options...
          </>
        ) : (
          <>
            <BanknoteIcon className="size-4" />
            Pay Now
          </>
        )}
      </Button> */}

      <div className="flex items-center gap-6">
        <div className="border-t flex-1"></div>
        <p className="text-sm text-muted-foreground text-center">or</p>
        <div className="border-t flex-1"></div>
      </div>

      {/* <Link
        href="https://securepay.sslcommerz.com/"
        target="_blank"
        className="flex justify-center"
      >

      </Link> */}
      <Dialog>
        <DialogTrigger className="cursor-pointer" asChild>
          <Image
            src="https://securepay.sslcommerz.com/public/image/SSLCommerz-Pay-With-logo-All-Size-01.png"
            height={300}
            width={1200}
            className="hover:scale-95 transition-transform"
            alt="SSLCommerz"
          />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pay Online with SSLCommerz</DialogTitle>
          </DialogHeader>
          <div className=""></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
