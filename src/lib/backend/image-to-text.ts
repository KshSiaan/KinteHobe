import { openrouter } from "@openrouter/ai-sdk-provider";
import { generateText, Output } from "ai";
import z from "zod";

const productSchema = z.object({
  title: z.string().describe("The title of the product"),
  description: z.string().describe("The description of the product"),
  weight: z.string().describe("The weight of the product guessed by the image. must be a number type in grams").optional(),
  metadataRows: z.array(z.object({
    id: z.string().describe("A random UUID string"),
    name: z.string().describe("Attribute name, e.g. Material, Color, Care instructions"),
    description: z.string().describe("Attribute value, e.g. 100% Cotton, Navy Blue, Machine wash cold"),
  })).describe("In-depth product attributes as name/value pairs"),
});

export async function ImageToText({ imageData }: { imageData: ArrayBuffer }) {
  const result = await generateText({
    model: openrouter("nvidia/nemotron-nano-12b-v2-vl:free"),
    system: "You are a product catalog assistant. Analyze the product image and return structured e-commerce product data. Be specific and accurate.",
    messages: [
      {
        role: "user",
        content: [
          {
            type:"image",
            image: imageData,
          },
          {
            type: "text",
            text: "Analyze this product image and fill out the product dataset.",
          },
        ],
      },
    ],
    output: Output.object({ schema: productSchema }),
  });

  return result.output;
}
