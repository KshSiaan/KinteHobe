import { CreateResponse } from "@/lib/backend/message";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

    if (!q) {
      return new Response("Missing search query", { status: 400 });
    }

    return CreateResponse({
        status: 200,
        message: "Search results fetched successfully",
        additionalData: {
            q: q,
        },
    })
}