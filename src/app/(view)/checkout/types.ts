export type CheckoutStep = "shipping" | "review";

export type ShippingForm = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};
