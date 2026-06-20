"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useCartStore, formatMoney } from "@/hooks/use-cart-store";
import { ArrowLeftIcon, LockIcon, MapPinIcon, PackageIcon } from "lucide-react";
import type { ShippingForm } from "../types";

type Props = {
  shipping: ShippingForm;
  onPlace: () => void;
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
          onClick={onPlace}
          disabled={isLoading}
          className="flex-[2] gap-2"
        >
          {isLoading ? (
            <>
              <Spinner className="size-4" />
              Redirecting to Stripe...
            </>
          ) : (
            <>
              <LockIcon className="size-4" />
              Pay with Stripe
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
