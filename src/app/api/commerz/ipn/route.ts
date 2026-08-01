import { db } from "@/lib/db";
import { SSLIPNRequest, SSLVerifyResponse } from "../type";
import { order, transaction } from "@/db/schema/order-schema";
import { eq } from "drizzle-orm";
import { createNotification } from "@/lib/notifications";

const FAILURE_MESSAGE =
    "Order Verification failed, Please contact support for further assistance.";

async function verificationFailed(
    orderId: string,
    userId: string | null | undefined,
    code: string
) {
    if (userId) {
        const notificationCreated = await createNotification({
            title: "Order Verification Failed",
            body: `Order Verification failed while processing for order ID: ${orderId}, Please contact support for further assistance. CODE: ${code}`,
            type: "order_cancelled",
            metadata: { orderId },
            userId,
        });

        if (!notificationCreated) {
            return Response.json(
                { message: "Something went wrong" },
                { status: 500 }
            );
        }
    }

    return Response.json(
        { message: FAILURE_MESSAGE },
        { status: 400 }
    );
};


export async function POST(request: Request) {
    const formData = await request.formData();

    const ipnData = Object.fromEntries(
        formData.entries()
    ) as unknown as SSLIPNRequest;

    const orderId = ipnData.tran_id;

    const [orderRecord] = await db
    .select()
    .from(order)
    .where(eq(order.id, orderId));

    if (!orderRecord) {
        return Response.json(
            { message: "Order not found" },
            { status: 401 }
        );
    }

    if (!orderRecord.userId) {
        return Response.json(
            { message: "Order has no associated user" },
            { status: 402 }
        );
    }

    const userId = orderRecord.userId;


    // Validate order
    if (!orderRecord || orderRecord.id !== orderId || ipnData.currency !== "BDT") {
        return verificationFailed(
            orderId,
            userId,
            "ORDER_VERIFICATION_FAILED"
        );
    }

    // Validate risk level
    if (ipnData.risk_level === 1) {
        return verificationFailed(
            orderId,
            userId,
            "R_LEVEL_HIGH"
        );
    }

    // Validate transaction
    const [transactionRecord] = await db
        .select()
        .from(transaction)
        .where(eq(transaction.orderId, orderId));

    if (!transactionRecord) {
        return verificationFailed(
            orderId,
            userId,
            "TRANSACTION_NOT_FOUND"
        );
    }

    // Verify payment with SSLCOMMERZ
    const verifyPaymentRequest = await fetch(
        `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${ipnData.val_id}&store_id=${process.env.SSL_COMMERZ_STORE_ID}&store_passwd=${process.env.SSL_COMMERZ_STORE_PASSWORD}&format=json`
    );

    if (!verifyPaymentRequest.ok) {
        return verificationFailed(
            orderId,
            userId,
            "PAYMENT_VERIFICATION_FAILED"
        );
    }

    const verifyPaymentResponse =
        (await verifyPaymentRequest.json()) as SSLVerifyResponse;

    if (verifyPaymentResponse.status !== "VALID") {
        return verificationFailed(
            orderId,
            userId,
            "PAYMENT_VERIFICATION_FAILED"
        );
    }

    // Mark order as paid
    const [updatedOrder] = await db
        .update(order)
        .set({ status: "paid" })
        .where(eq(order.id, orderId))
        .returning({ id: order.id });

    if (!updatedOrder) {
        return verificationFailed(
            orderId,
            userId,
            "ORDER_UPDATE_FAILED"
        );
    }

    // Notify user about successful payment
    const notificationCreated = await createNotification({
        userId,
        type: "order_status_changed",
        title: "Payment confirmed",
        body: `Payment for order #${orderId
            .slice(0, 8)
            .toUpperCase()} was successful. Your order is now being processed.`,
        metadata: { orderId },
    });

    if (!notificationCreated) {
        return Response.json(
            { message: "Something went wrong" },
            { status: 500 }
        );
    }

    return Response.json(
        { message: "Order Verified Successfully" },
        { status: 200 }
    );
}