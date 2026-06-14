import { Metadata } from "next";
import CartClient from "./cart-client";

export const metadata: Metadata = {
  title: "Cart — KinteHobe",
  description: "Review your cart before checkout",
};

export default function CartPage() {
  return <CartClient />;
}
