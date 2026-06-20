"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCardIcon } from "lucide-react";
import { sileo } from "sileo";

export function PayButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/order/${orderId}/pay`);
      const json = await res.json();
      if (!res.ok) {
        sileo.error({
          title: "Payment failed",
          description: json.message ?? "Could not retrieve payment session.",
        });
        return;
      }
      window.location.href = json.url;
    } catch {
      sileo.error({
        title: "Payment failed",
        description: "Something went wrong. Try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      onClick={handlePay}
      disabled={loading}
      className="gap-2"
    >
      <CreditCardIcon className="size-3.5" />
      {loading ? "Redirecting..." : "Complete Payment"}
    </Button>
  );
}
