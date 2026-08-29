import { promotion } from "@/db/schema";
import { auth } from "@/lib/auth";
import { CreateResponse } from "@/lib/backend/message";
import { db } from "@/lib/db";
import z from "zod";


const promotionSchema = z.object({
    variant: z.string().min(1, "Variant is required"),
    appearance: z.string().min(1, "Appearance is required"),
    title: z.string().min(1, "Title is required"),
    url: z.url("Invalid URL").optional(),
});

export async function POST(req: Request) {
    const session = await auth.api.getSession(req);
    if (session?.user.role !== "admin") {
        return new Response("Unauthorized", { status: 401 });
    }


    const body = await req.json();
    if (!body) {
        return CreateResponse({
        "ok": false,
        "message": "No request body",
        "status": 400
    })
    }
    const validationResult = promotionSchema.safeParse(body);
    if (!validationResult.success) {
        return CreateResponse({
            "ok": false,
            "message": "Invalid request body",
            "status": 400
        });
    }
    const [res] = await db.insert(promotion).values({
        id: crypto.randomUUID(),
        promotionTitle: validationResult.data.title,
        promotionUrl: validationResult.data.url,
        appearance: validationResult.data.appearance,
        variant: validationResult.data.variant,
    }).returning();

    if (!res) {
        return CreateResponse({
            "ok": false,
            "message": "Failed to create promotion",
            "status": 500
        });
    }
    
    return CreateResponse({
        "ok": true,
        "message": "Promotion created successfully",
        "status": 200
    })
}



