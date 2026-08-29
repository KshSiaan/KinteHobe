import { promotion } from "@/db/schema";
import { CreateResponse } from "@/lib/backend/message";
import { db } from "@/lib/db";

export async function GET(req: Request) {
    const res = await db.select().from(promotion);
    return CreateResponse({
        "ok": true,
        "message": "Promotions retrieved successfully",
        "status": 200,
        "additionalData": {
            data:res
        }
    });
}