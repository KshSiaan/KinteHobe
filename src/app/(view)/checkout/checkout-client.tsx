"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/hooks/use-cart-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeftIcon, LogInIcon } from "lucide-react";
import { sileo } from "sileo";
import { StepIndicator } from "./_components/step-indicator";
import { OrderSummary } from "./_components/order-summary";
import { ShippingStep } from "./_components/shipping-step";
import { ReviewStep } from "./_components/review-step";
import { EmptyCartView } from "./_components/empty-cart-view";
import type { CheckoutStep, ShippingForm } from "./types";
import { authClient } from "@/lib/auth-client";

const INITIAL_SHIPPING: ShippingForm = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  country: "",
};

function validateShipping(form: ShippingForm): Record<string, string> {
  const errs: Record<string, string> = {};
  if (!form.fullName.trim()) errs.fullName = "Full name is required";
  if (!form.email.trim()) errs.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errs.email = "Invalid email";
  if (!form.phone.trim()) errs.phone = "Phone is required";
  if (!form.address.trim()) errs.address = "Address is required";
  if (!form.city.trim()) errs.city = "City is required";
  if (!form.state.trim()) errs.state = "State is required";
  if (!form.zip.trim()) errs.zip = "ZIP code is required";
  if (!form.country.trim()) errs.country = "Country is required";
  return errs;
}

export default function CheckoutClient() {
  const { data } = authClient.useSession();
  const { items } = useCartStore();
  const [step, setStep] = useState<CheckoutStep>("shipping");
  const [isLoading, setIsLoading] = useState(false);
  const [shippingForm, setShippingForm] =
    useState<ShippingForm>(INITIAL_SHIPPING);
  const [shippingErrors, setShippingErrors] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    if (!data?.user) return;
    setShippingForm((prev) => ({
      ...prev,
      fullName: prev.fullName || data.user.name || "",
      email: prev.email || data.user.email || "",
    }));
  }, [data?.user]);

  if (items.length === 0) {
    return <EmptyCartView />;
  }

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setShippingForm((prev) => ({ ...prev, [id]: value }));
    if (shippingErrors[id]) {
      setShippingErrors((prev) => {
        const n = { ...prev };
        delete n[id];
        return n;
      });
    }
  };

  const handleFillFromAddress = (partial: Partial<ShippingForm>) => {
    setShippingForm((prev) => ({ ...prev, ...partial }));
    setShippingErrors({});
  };

  const goToReview = () => {
    const errs = validateShipping(shippingForm);
    if (Object.keys(errs).length) {
      setShippingErrors(errs);
      return;
    }
    setStep("review");
  };

  const placeOrder = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipping: shippingForm, items }),
      });
      if (!res.ok) {
        const err = await res.json();
        sileo.error({
          title: "Checkout failed",
          description: err.message ?? "Something went wrong",
        });
        return;
      }
      const { url } = await res.json();
      window.location.href = url;
    } catch (e: any) {
      if (e.message === "Unauthorized") {
        sileo.error({
          title: "Checkout failed",
          description: "You must be logged in to place an order.",
        });
        window.location.href = "/auth/login";
      } else {
        sileo.error({
          title: "Checkout failed",
          description: "Unable to reach payment provider. Try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart">
              <ArrowLeftIcon className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Checkout</h1>
            <p className="text-sm text-muted-foreground">
              Complete your purchase securely
            </p>
          </div>
        </div>

        <div className="mb-8 flex justify-center">
          <StepIndicator current={step} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          <div className="lg:col-span-3">
            {data?.session?.token ? (
              <Card>
                <CardContent className="pt-6">
                  {step === "shipping" && (
                    <ShippingStep
                      form={shippingForm}
                      errors={shippingErrors}
                      onChange={handleShippingChange}
                      onNext={goToReview}
                      onFill={handleFillFromAddress}
                      isLoading={isLoading}
                    />
                  )}
                  {step === "review" && (
                    <ReviewStep
                      shipping={shippingForm}
                      onPlace={placeOrder}
                      onBack={() => setStep("shipping")}
                      isLoading={isLoading}
                    />
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="overflow-hidden border-border/60 bg-card/70 backdrop-blur-xl">
                <CardContent className="p-0">
                  <div className="border-b bg-muted/30 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                        <LogInIcon className="size-5 text-primary" />
                      </div>

                      <div>
                        <h2 className="text-base font-semibold tracking-tight">
                          Continue with your account
                        </h2>

                        <p className="text-sm text-muted-foreground">
                          Sign in to complete checkout securely.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5 px-6 py-5">
                    <div className="rounded-xl border bg-background/60 p-4">
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        Your cart and order summary are ready. Logging in allows
                        you to place orders, track purchases, and manage your
                        account seamlessly.
                      </p>
                    </div>

                    <Button asChild size="lg" className="w-full font-medium">
                      <Link href="/auth/login">Log In to Continue</Link>
                    </Button>

                    <p className="text-center text-xs text-muted-foreground">
                      Secure checkout powered by encrypted authentication.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-2">
            <OrderSummary />
          </div>
        </div>
      </div>
    </main>
  );
}
