import { auth } from "@/lib/auth";
import { CreateResponse } from "@/lib/backend/message";
import z from "zod";


const promotionSchema = z.object({
    variant: z.string().min(1, "Variant is required"),
    appearance: z.string().min(1, "Appearance is required"),
    title: z.string().min(1, "Title is required"),
    url: z.string().url("Invalid URL").optional(),
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

    

    return CreateResponse({
        "ok": true,
        "message": "Promotion created successfully",
        "status": 200
    })
}