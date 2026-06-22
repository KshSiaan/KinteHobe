"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, MapPinIcon } from "lucide-react";
import type { ShippingForm } from "../types";
import type { UserAddress } from "@/components/core/base/saved-location";
import { cn } from "@/lib/utils";

type Props = {
  form: ShippingForm;
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
  onFill: (partial: Partial<ShippingForm>) => void;
  isLoading: boolean;
};

function mapAddressToShipping(a: UserAddress): Partial<ShippingForm> {
  return {
    fullName: a.recipient_name ?? "",
    phone: a.phone,
    address: [a.address_line, a.area].filter(Boolean).join(", "),
    city: a.city,
    state: a.district,
  };
}

export function ShippingStep({
  form,
  errors,
  onChange,
  onNext,
  onFill,
  isLoading,
}: Props) {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const onFillRef = useRef(onFill);
  onFillRef.current = onFill;

  useEffect(() => {
    fetch("/api/manage/location")
      .then((r) => r.json())
      .then((json) => {
        if (json.data?.length) {
          setAddresses(json.data);
          const def: UserAddress =
            json.data.find((a: UserAddress) => a.is_default) ?? json.data[0];
          setSelectedId(def.id);
          onFillRef.current(mapAddressToShipping(def));
        }
      })
      .catch(() => {});
  }, []);

  function handleSelect(address: UserAddress) {
    setSelectedId(address.id);
    onFill(mapAddressToShipping(address));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <MapPinIcon className="size-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Shipping Address</h2>
          <p className="text-sm text-muted-foreground">
            Where should we deliver your order?
          </p>
        </div>
      </div>

      {addresses.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Saved addresses
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {addresses.map((address) => (
              <button
                key={address.id}
                type="button"
                onClick={() => handleSelect(address)}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3 text-left text-sm transition-colors hover:bg-muted",
                  selectedId === address.id
                    ? "border-primary bg-primary/5"
                    : "border-border",
                )}
              >
                <div className="mt-0.5 shrink-0">
                  {selectedId === address.id ? (
                    <span className="flex size-4 items-center justify-center rounded-full bg-primary">
                      <CheckIcon className="size-2.5 text-primary-foreground" />
                    </span>
                  ) : (
                    <span className="flex size-4 items-center justify-center rounded-full border" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">{address.label}</span>
                    {address.is_default && (
                      <Badge variant="secondary" className="px-1 py-0 text-xs">
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="truncate text-muted-foreground">
                    {address.address_line}, {address.area}
                  </p>
                  <p className="text-muted-foreground">
                    {address.city}, {address.district}
                  </p>
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Edit the fields below to adjust the selected address.
          </p>
        </div>
      )}

      <FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <Field data-invalid={!!errors.fullName} className="col-span-2">
            <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
            <Input
              id="fullName"
              placeholder="John Doe"
              value={form.fullName}
              onChange={onChange}
              disabled={isLoading}
              aria-invalid={!!errors.fullName}
            />
            {errors.fullName && (
              <FieldDescription className="text-destructive">
                {errors.fullName}
              </FieldDescription>
            )}
          </Field>

          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={onChange}
              disabled={isLoading}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <FieldDescription className="text-destructive">
                {errors.email}
              </FieldDescription>
            )}
          </Field>

          <Field data-invalid={!!errors.phone}>
            <FieldLabel htmlFor="phone">Phone</FieldLabel>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={form.phone}
              onChange={onChange}
              disabled={isLoading}
              aria-invalid={!!errors.phone}
            />
            {errors.phone && (
              <FieldDescription className="text-destructive">
                {errors.phone}
              </FieldDescription>
            )}
          </Field>

          <Field data-invalid={!!errors.address} className="col-span-2">
            <FieldLabel htmlFor="address">Street Address</FieldLabel>
            <Input
              id="address"
              placeholder="123 Main St, Apt 4B"
              value={form.address}
              onChange={onChange}
              disabled={isLoading}
              aria-invalid={!!errors.address}
            />
            {errors.address && (
              <FieldDescription className="text-destructive">
                {errors.address}
              </FieldDescription>
            )}
          </Field>

          <Field data-invalid={!!errors.city}>
            <FieldLabel htmlFor="city">City</FieldLabel>
            <Input
              id="city"
              placeholder="New York"
              value={form.city}
              onChange={onChange}
              disabled={isLoading}
              aria-invalid={!!errors.city}
            />
            {errors.city && (
              <FieldDescription className="text-destructive">
                {errors.city}
              </FieldDescription>
            )}
          </Field>

          <Field data-invalid={!!errors.state}>
            <FieldLabel htmlFor="state">State / Province</FieldLabel>
            <Input
              id="state"
              placeholder="NY"
              value={form.state}
              onChange={onChange}
              disabled={isLoading}
              aria-invalid={!!errors.state}
            />
            {errors.state && (
              <FieldDescription className="text-destructive">
                {errors.state}
              </FieldDescription>
            )}
          </Field>

          <Field data-invalid={!!errors.zip}>
            <FieldLabel htmlFor="zip">ZIP / Postal Code</FieldLabel>
            <Input
              id="zip"
              placeholder="10001"
              value={form.zip}
              onChange={onChange}
              disabled={isLoading}
              aria-invalid={!!errors.zip}
            />
            {errors.zip && (
              <FieldDescription className="text-destructive">
                {errors.zip}
              </FieldDescription>
            )}
          </Field>

          <Field data-invalid={!!errors.country}>
            <FieldLabel htmlFor="country">Country</FieldLabel>
            <Input
              id="country"
              placeholder="United States"
              value={form.country}
              onChange={onChange}
              disabled={isLoading}
              aria-invalid={!!errors.country}
            />
            {errors.country && (
              <FieldDescription className="text-destructive">
                {errors.country}
              </FieldDescription>
            )}
          </Field>
        </div>
      </FieldGroup>

      <Button onClick={onNext} disabled={isLoading} className="w-full gap-2">
        {isLoading && <Spinner className="size-4" />}
        Continue to Review
      </Button>
    </div>
  );
}
