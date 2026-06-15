"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { MapPinIcon } from "lucide-react";
import type { ShippingForm } from "../types";

type Props = {
  form: ShippingForm;
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
  isLoading: boolean;
};

export function ShippingStep({
  form,
  errors,
  onChange,
  onNext,
  isLoading,
}: Props) {
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
