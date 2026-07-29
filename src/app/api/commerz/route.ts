import { auth } from "@/lib/auth";
import z from "zod";
import type { CartLineItem } from "@/hooks/use-cart-store";
import type { ShippingForm } from "@/app/(view)/checkout/types";
import { SSLInitResponse } from "./type";
import { db } from "@/lib/db";
import { order, orderItem, transaction } from "@/db/schema/order-schema";
import { createNotification } from "@/lib/notifications";

const shippingSchema = z.object({
  fullName: z.string().min(1),
  email: z.email(),
  phone: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  country: z.string().min(1),
});

const bodySchema = z.object({
  shipping: shippingSchema,
  type: z.enum(["stripe", "cash", "online"]),
  provider: z.enum(["bkash", "nagad", "rocket"]),
  items: z.array(z.object({
    productId: z.string(),
    productSlug: z.string(),
    productTitle: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
    lineTotal: z.number().positive(),
   
    selection: z.object({
      variantId: z.string(),
      title: z.string().optional().nullable(),
      sku: z.string().optional().nullable(),
      images: z.array(z.string()).default([]),
    }),
  })).min(1),
});


interface SSLCommerzDataType {
    store_id: string;
    store_passwd: string;
    total_amount: number;
    currency: string;
    tran_id: string;
    success_url: string;
    fail_url: string;
    cancel_url: string;
    ipn_url: string;
    shipping_method: string;
    product_name: string;
    product_category?: string;
    product_profile?: string;
    cus_name: string;
    cus_email: string;
    cus_add1: string;
    cus_add2?: string;
    cus_city: string;
    cus_state: string;
    cus_postcode: string;
    cus_country: string;
    cus_phone: string;
    cus_fax?: string;
    ship_name: string;
    ship_add1: string;
    ship_add2?: string;
    ship_city: string;
    ship_state: string;
    ship_postcode: number;
    ship_country: string;
}

export async function POST(request: Request) {
    const session = await auth.api.getSession({ headers: request.headers });
    
      if (!session?.session.token) {
        return Response.json({ message: "Unauthorized" }, { status: 401 });
      }
    
      const raw = await request.json();
      const parsed = bodySchema.safeParse(raw);
      if (!parsed.success) {
        return Response.json(
          { message: "Invalid request", issues: z.flattenError(parsed.error).fieldErrors },
          { status: 400 },
        );
      }
    
      const { shipping, items, type, provider } = parsed.data as {
        shipping: ShippingForm;
        items: CartLineItem[];
        type: "stripe" | "cash" | "online";
        provider: "bkash" | "nagad" | "rocket";
      };

      if (type !== "online") {
        return Response.json(
          { message: "Invalid payment type" },
          { status: 400 },
        );
      }
      const orderId = crypto.randomUUID();
    const origin =
    request.headers.get("origin") ??
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ??
    "http://localhost:3000";

      await db.insert(order).values({
        id: orderId,
        userId: session?.user.id ?? null,
        email: shipping.email,
        status: type==="online"?"pending_payment":"awaiting_cod",
        shippingName: shipping.fullName,
        shippingPhone: shipping.phone,
        shippingAddress: shipping.address,
        shippingCity: shipping.city,
        shippingState: shipping.state,
        shippingZip: shipping.zip,
        shippingCountry: shipping.country,
        paymentMethod:type === "online"?"cash_on_delivery":"stripe",
        subtotalCents: items.reduce((sum, i) => sum + Math.round(i.lineTotal * 100), 0),
        taxCents: 0,
        shippingCents: 0,
        totalCents: items.reduce((sum, i) => sum + Math.round(i.lineTotal * 100), 0),
      });
    
      await db.insert(orderItem).values(
        items.map((item) => ({
          id: crypto.randomUUID(),
          orderId,
          productId: item.productId,
          variantId: item.selection.variantId,
          productTitle: item.productTitle,
          variantTitle: item.selection.title ?? null,
          sku: item.selection.sku ?? null,
          quantity: item.quantity,
          unitPriceCents: Math.round(item.unitPrice * 100),
          lineTotalCents: Math.round(item.lineTotal * 100),
          imageUrl: item.selection.images?.[0] ?? null,
        })),
      );

    await createNotification({
          userId: session.user.id,
          type: "order_placed",
          title: "Order placed",
          body: `Your order #${orderId.slice(0, 8).toUpperCase()} has been placed and is awaiting payment.`,
          metadata: { orderId },
    });

    const sslCommerzData: SSLCommerzDataType = {
      store_id: process.env.SSL_COMMERZ_STORE_ID || "",
      store_passwd: process.env.SSL_COMMERZ_STORE_PASSWORD || "",
      total_amount: items.reduce((acc, item) => acc + item.lineTotal, 0),
      currency: "BDT",
      tran_id: crypto.randomUUID(),
      success_url: `${origin}/order/success?order_id=${orderId}`,
      fail_url: `${origin}/order/cancel?order_id=${orderId}`,
      cancel_url: `${origin}/order/cancel?order_id=${orderId}`,
      ipn_url: `${origin}/order/ipn`,
      shipping_method: "Courier",
      product_name: items.map((item) => item.productTitle).join(", "),
      cus_name: shipping.fullName,
      cus_email: shipping.email,
      cus_add1: shipping.address,
      cus_city: shipping.city,
      cus_state: shipping.state,
      cus_postcode: shipping.zip,
      cus_country: shipping.country,
      cus_phone: shipping.phone,
      ship_name: shipping.fullName,
      ship_add1: shipping.address,
      ship_city: shipping.city,
      ship_state: shipping.state,
      ship_postcode: parseInt(shipping.zip),
      ship_country: shipping.country,
    };

    //need to covert to form data
    const formData = new FormData();
    for (const key in sslCommerzData) {
        formData.append(key, (sslCommerzData as any)[key]);
    }
    
    const response = await fetch("https://sandbox.sslcommerz.com/gwprocess/v4/api.php", {
      method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        return Response.json(
            { message: "Failed to create SSLCommerz session", error: errorData },
            { status: 500 }
        );
    }

    const sslCommerzResponse:SSLInitResponse = await response.json();

    const providerObject = sslCommerzResponse?.desc?.find((item) => item.gw === provider);
    
    if (!providerObject) {
        return Response.json(
            { message: `Payment provider ${provider} not found in SSLCommerz response` },
            { status: 500 }
        );
    }

    await db.insert(transaction).values({
        id: crypto.randomUUID(),
        orderId,
        amountCents: items.reduce((sum, i) => sum + Math.round(i.lineTotal * 100), 0),
        currency: "bdt",
        status: "pending",
        onlinePaymentId: sslCommerzResponse?.sessionkey,
        paymentProvider: provider,
      });

    return Response.json({ url: providerObject.redirectGatewayURL, orderId });

    

}


