import { db } from "@/lib/db";
import { SSLIPNRequest } from "../type";
import { order, transaction } from "@/db/schema/order-schema";
import { eq } from "drizzle-orm";
import { createNotification } from "@/lib/notifications";




async function POST(request: Request) {
    const ipnData = await request.json() as SSLIPNRequest;

    const orderId = ipnData.tran_id;

    const [orderRecord] = await db.select().from(order).where(eq(order.id, orderId));


    if(orderRecord?.id !== ipnData.tran_id){
        return createNotification({
            title: "Order Verification Failed",
            body:`Order Verification failed while processing for order ID: ${ipnData.tran_id}, Please contact support for further assistance.`,
            type:"order_cancelled",
            metadata:{orderId:ipnData.tran_id},
            "userId":orderRecord?.userId || "",
        });
    }

    const [transactionRecord] = await db.select().from(transaction).where(eq(transaction.orderId, orderId));
    

}