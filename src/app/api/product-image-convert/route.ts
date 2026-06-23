import { ImageToText } from "@/lib/backend/image-to-text";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const result = await ImageToText({ imageData: arrayBuffer });

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Image to text error:", error);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 },
    );
  }
}
