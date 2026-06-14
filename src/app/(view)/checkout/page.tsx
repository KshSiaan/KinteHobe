import { Metadata } from "next";
import CheckoutClient from "./checkout-client";

export const metadata: Metadata = {
  title: "Checkout — KinteHobe",
  description: "Complete your purchase",
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
