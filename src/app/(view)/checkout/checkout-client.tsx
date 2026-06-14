"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore, formatMoney } from "@/hooks/use-cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  CreditCardIcon,
  LockIcon,
  MapPinIcon,
  PackageIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  TruckIcon,
} from "lucide-react";
import { sileo } from "sileo";

type Step = "shipping" | "payment" | "review";

type ShippingForm = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

type PaymentForm = {
  cardNumber: string;
  cardName: string;
  expiry: string;
  cvv: string;
};

const STEPS: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: "shipping", label: "Shipping", icon: TruckIcon },
  { id: "payment", label: "Payment", icon: CreditCardIcon },
  { id: "review", label: "Review", icon: PackageIcon },
];

const STEP_ORDER: Step[] = ["shipping", "payment", "review"];

function StepIndicator({ current }: { current: Step }) {
  const currentIndex = STEP_ORDER.indexOf(current);
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        const Icon = step.icon;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={[
                  "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors",
                  done
                    ? "border-primary bg-primary text-primary-foreground"
                    : active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted bg-muted text-muted-foreground",
                ].join(" ")}
              >
                {done ? (
                  <CheckCircle2Icon className="size-4" />
                ) : (
                  <Icon className="size-4" />
                )}
              </div>
              <span
                className={[
                  "text-xs font-medium",
                  active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground",
                ].join(" ")}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={[
                  "mb-5 h-0.5 w-16 transition-colors",
                  done ? "bg-primary" : "bg-muted",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderSummary() {
  const { items, subtotal, itemCount } = useCartStore();

  return (
    <Card className="sticky top-28">
      <CardHeader className="border-b pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingBagIcon className="size-4 text-primary" />
            Order Summary
          </CardTitle>
          <Badge variant="secondary">{itemCount} item{itemCount !== 1 ? "s" : ""}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
          {items.map((item) => {
            const image = item.selection.images?.[0] ?? null;
            return (
              <div key={item.id} className="flex gap-3 items-start">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border bg-muted">
                  {image ? (
                    <Image
                      src={image}
                      alt={item.productTitle}
                      width={56}
                      height={56}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ShoppingCartIcon className="size-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{item.productTitle}</p>
                  {item.selection.title && (
                    <p className="text-xs text-muted-foreground">{item.selection.title}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold tabular-nums shrink-0">
                  {formatMoney(item.lineTotal)}
                </p>
              </div>
            );
          })}
        </div>

        <Separator className="my-4" />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatMoney(subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Shipping</span>
            <span className="text-green-600 font-medium">Free</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Tax (estimated)</span>
            <span className="tabular-nums">{formatMoney(subtotal * 0.08)}</span>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex justify-between font-semibold text-base">
          <span>Total</span>
          <span className="tabular-nums">{formatMoney(subtotal * 1.08)}</span>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-green-500/10 px-3 py-2">
          <TruckIcon className="size-4 text-green-600 shrink-0" />
          <p className="text-xs text-green-700 dark:text-green-400">
            Free standard shipping on this order
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ShippingStep({
  form,
  errors,
  onChange,
  onNext,
  isLoading,
}: {
  form: ShippingForm;
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <MapPinIcon className="size-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Shipping Address</h2>
          <p className="text-sm text-muted-foreground">Where should we deliver your order?</p>
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
              <FieldDescription className="text-destructive">{errors.fullName}</FieldDescription>
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
              <FieldDescription className="text-destructive">{errors.email}</FieldDescription>
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
              <FieldDescription className="text-destructive">{errors.phone}</FieldDescription>
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
              <FieldDescription className="text-destructive">{errors.address}</FieldDescription>
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
              <FieldDescription className="text-destructive">{errors.city}</FieldDescription>
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
              <FieldDescription className="text-destructive">{errors.state}</FieldDescription>
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
              <FieldDescription className="text-destructive">{errors.zip}</FieldDescription>
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
              <FieldDescription className="text-destructive">{errors.country}</FieldDescription>
            )}
          </Field>
        </div>
      </FieldGroup>

      <Button onClick={onNext} disabled={isLoading} className="w-full gap-2">
        {isLoading && <Spinner className="size-4" />}
        Continue to Payment
      </Button>
    </div>
  );
}

function PaymentStep({
  form,
  errors,
  onChange,
  onNext,
  onBack,
  isLoading,
}: {
  form: PaymentForm;
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <CreditCardIcon className="size-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Payment Details</h2>
          <p className="text-sm text-muted-foreground">Your payment info is encrypted and secure.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-green-500/30 bg-green-500/5 px-4 py-2.5">
        <LockIcon className="size-4 text-green-600 shrink-0" />
        <p className="text-xs text-green-700 dark:text-green-400">
          256-bit SSL encryption — your data is safe
        </p>
      </div>

      <FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <Field data-invalid={!!errors.cardNumber} className="col-span-2">
            <FieldLabel htmlFor="cardNumber">Card Number</FieldLabel>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={form.cardNumber}
              onChange={onChange}
              disabled={isLoading}
              aria-invalid={!!errors.cardNumber}
              maxLength={19}
            />
            {errors.cardNumber && (
              <FieldDescription className="text-destructive">{errors.cardNumber}</FieldDescription>
            )}
          </Field>

          <Field data-invalid={!!errors.cardName} className="col-span-2">
            <FieldLabel htmlFor="cardName">Name on Card</FieldLabel>
            <Input
              id="cardName"
              placeholder="John Doe"
              value={form.cardName}
              onChange={onChange}
              disabled={isLoading}
              aria-invalid={!!errors.cardName}
            />
            {errors.cardName && (
              <FieldDescription className="text-destructive">{errors.cardName}</FieldDescription>
            )}
          </Field>

          <Field data-invalid={!!errors.expiry}>
            <FieldLabel htmlFor="expiry">Expiry Date</FieldLabel>
            <Input
              id="expiry"
              placeholder="MM / YY"
              value={form.expiry}
              onChange={onChange}
              disabled={isLoading}
              aria-invalid={!!errors.expiry}
              maxLength={7}
            />
            {errors.expiry && (
              <FieldDescription className="text-destructive">{errors.expiry}</FieldDescription>
            )}
          </Field>

          <Field data-invalid={!!errors.cvv}>
            <FieldLabel htmlFor="cvv">CVV</FieldLabel>
            <Input
              id="cvv"
              placeholder="123"
              value={form.cvv}
              onChange={onChange}
              disabled={isLoading}
              aria-invalid={!!errors.cvv}
              maxLength={4}
              type="password"
            />
            {errors.cvv && (
              <FieldDescription className="text-destructive">{errors.cvv}</FieldDescription>
            )}
          </Field>
        </div>
      </FieldGroup>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} disabled={isLoading} className="flex-1">
          <ArrowLeftIcon className="size-4" />
          Back
        </Button>
        <Button onClick={onNext} disabled={isLoading} className="flex-[2] gap-2">
          {isLoading && <Spinner className="size-4" />}
          Review Order
        </Button>
      </div>
    </div>
  );
}

function ReviewStep({
  shipping,
  payment,
  onPlace,
  onBack,
  isLoading,
}: {
  shipping: ShippingForm;
  payment: PaymentForm;
  onPlace: () => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  const maskedCard = payment.cardNumber
    ? `•••• •••• •••• ${payment.cardNumber.replace(/\s/g, "").slice(-4)}`
    : "—";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <PackageIcon className="size-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Review & Place Order</h2>
          <p className="text-sm text-muted-foreground">Double-check your details before confirming.</p>
        </div>
      </div>

      <div className="rounded-3xl border bg-muted/30 p-5 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Shipping To
          </p>
          <p className="text-sm font-medium">{shipping.fullName}</p>
          <p className="text-sm text-muted-foreground">{shipping.address}</p>
          <p className="text-sm text-muted-foreground">
            {shipping.city}, {shipping.state} {shipping.zip}
          </p>
          <p className="text-sm text-muted-foreground">{shipping.country}</p>
          <p className="text-sm text-muted-foreground mt-1">{shipping.email} · {shipping.phone}</p>
        </div>

        <Separator />

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Payment
          </p>
          <div className="flex items-center gap-2">
            <CreditCardIcon className="size-4 text-muted-foreground" />
            <p className="text-sm font-medium">{maskedCard}</p>
          </div>
          <p className="text-sm text-muted-foreground">{payment.cardName}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} disabled={isLoading} className="flex-1">
          <ArrowLeftIcon className="size-4" />
          Back
        </Button>
        <Button onClick={onPlace} disabled={isLoading} className="flex-[2] gap-2">
          {isLoading ? (
            <>
              <Spinner className="size-4" />
              Placing Order...
            </>
          ) : (
            <>
              <LockIcon className="size-4" />
              Place Order
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function SuccessView() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
        <CheckCircle2Icon className="size-10 text-green-600" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Order Placed!</h2>
        <p className="text-muted-foreground max-w-sm">
          Thank you for your purchase. You'll receive a confirmation email shortly.
        </p>
      </div>
      <div className="flex gap-3 mt-2">
        <Button asChild variant="outline">
          <Link href="/me/orders">View Orders</Link>
        </Button>
        <Button asChild>
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}

export default function CheckoutClient() {
  const { items, clearCart } = useCartStore();
  const [step, setStep] = useState<Step>("shipping");
  const [done, setDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [shippingForm, setShippingForm] = useState<ShippingForm>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });
  const [shippingErrors, setShippingErrors] = useState<Record<string, string>>({});

  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({});

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setShippingForm((prev) => ({ ...prev, [id]: value }));
    if (shippingErrors[id]) {
      setShippingErrors((prev) => { const n = { ...prev }; delete n[id]; return n; });
    }
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPaymentForm((prev) => ({ ...prev, [id]: value }));
    if (paymentErrors[id]) {
      setPaymentErrors((prev) => { const n = { ...prev }; delete n[id]; return n; });
    }
  };

  const validateShipping = () => {
    const errs: Record<string, string> = {};
    if (!shippingForm.fullName.trim()) errs.fullName = "Full name is required";
    if (!shippingForm.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingForm.email)) errs.email = "Invalid email";
    if (!shippingForm.phone.trim()) errs.phone = "Phone is required";
    if (!shippingForm.address.trim()) errs.address = "Address is required";
    if (!shippingForm.city.trim()) errs.city = "City is required";
    if (!shippingForm.state.trim()) errs.state = "State is required";
    if (!shippingForm.zip.trim()) errs.zip = "ZIP code is required";
    if (!shippingForm.country.trim()) errs.country = "Country is required";
    return errs;
  };

  const validatePayment = () => {
    const errs: Record<string, string> = {};
    const raw = paymentForm.cardNumber.replace(/\s/g, "");
    if (!raw) errs.cardNumber = "Card number is required";
    else if (raw.length < 13) errs.cardNumber = "Invalid card number";
    if (!paymentForm.cardName.trim()) errs.cardName = "Name on card is required";
    if (!paymentForm.expiry.trim()) errs.expiry = "Expiry date is required";
    else if (!/^\d{2}\s?\/\s?\d{2}$/.test(paymentForm.expiry)) errs.expiry = "Format: MM / YY";
    if (!paymentForm.cvv.trim()) errs.cvv = "CVV is required";
    else if (paymentForm.cvv.length < 3) errs.cvv = "Invalid CVV";
    return errs;
  };

  const goToPayment = () => {
    const errs = validateShipping();
    if (Object.keys(errs).length) { setShippingErrors(errs); return; }
    setStep("payment");
  };

  const goToReview = () => {
    const errs = validatePayment();
    if (Object.keys(errs).length) { setPaymentErrors(errs); return; }
    setStep("review");
  };

  const placeOrder = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    setIsLoading(false);
    clearCart();
    setDone(true);
    sileo.success({
      title: "Order confirmed!",
      description: "Check your email for details.",
    });
  };

  if (items.length === 0 && !done) {
    return (
      <main className="p-8 flex flex-col items-center justify-center min-h-[60dvh] gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <ShoppingCartIcon className="size-10 text-muted-foreground" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">Your cart is empty</h2>
          <p className="text-muted-foreground text-sm">Add some items before checking out.</p>
        </div>
        <Button asChild>
          <Link href="/">Browse Products</Link>
        </Button>
      </main>
    );
  }

  if (done) {
    return (
      <main className="p-8 max-w-lg mx-auto">
        <SuccessView />
      </main>
    );
  }

  return (
    <main className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart">
              <ArrowLeftIcon className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Checkout</h1>
            <p className="text-sm text-muted-foreground">Complete your purchase securely</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="mb-8 flex justify-center">
          <StepIndicator current={step} />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          {/* Form */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="pt-6">
                {step === "shipping" && (
                  <ShippingStep
                    form={shippingForm}
                    errors={shippingErrors}
                    onChange={handleShippingChange}
                    onNext={goToPayment}
                    isLoading={isLoading}
                  />
                )}
                {step === "payment" && (
                  <PaymentStep
                    form={paymentForm}
                    errors={paymentErrors}
                    onChange={handlePaymentChange}
                    onNext={goToReview}
                    onBack={() => setStep("shipping")}
                    isLoading={isLoading}
                  />
                )}
                {step === "review" && (
                  <ReviewStep
                    shipping={shippingForm}
                    payment={paymentForm}
                    onPlace={placeOrder}
                    onBack={() => setStep("payment")}
                    isLoading={isLoading}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-2">
            <OrderSummary />
          </div>
        </div>
      </div>
    </main>
  );
}
