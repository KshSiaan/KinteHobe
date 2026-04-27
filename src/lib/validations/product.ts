import { z } from "zod";
import { metadataTableSchema } from "@/lib/validations/metadata-table";

export const productBaseSchema = z.object({
  images: z
    .array(z.instanceof(File))
    .min(1, "At least one product image is required")
    .max(4, "You can upload up to 4 product images"),
  title: z
    .string()
    .trim()
    .min(2, "Product title must be at least 2 characters")
    .max(120, "Product title must be at most 120 characters"),
  description: z
    .string()
    .trim()
    .min(10, "Product description must be at least 10 characters")
    .max(1500, "Product description must be at most 1500 characters"),
  stockQuantity: z
    .string()
    .trim()
    .min(1, "Stock quantity is required")
    .regex(/^\d+$/, "Stock quantity must be a non-negative integer")
    .transform(Number),
  sku: z
    .string()
    .trim()
    .max(64, "SKU number must be at most 64 characters")
    .or(z.literal(""))
    .transform((value) => (value === "" ? undefined : value)),
  weight: z
    .string()
    .trim()
    .max(30, "Weight must be at most 30 characters")
    .or(z.literal(""))
    .transform((value) => (value === "" ? undefined : value)),
  price: z
    .string()
    .trim()
    .min(1, "Price is required")
    .regex(/^(?:\d+|\d+\.\d{1,2})$/, "Price must be a valid amount")
    .transform(Number),
  compareAtPrice: z
    .string()
    .trim()
    .regex(/^$|^(?:\d+|\d+\.\d{1,2})$/, "Compare-at price must be valid")
    .transform((value) => (value === "" ? undefined : Number(value))),
  metadataRows: metadataTableSchema,
});

export type ProductBaseFormInput = z.input<typeof productBaseSchema>;
export type ProductBaseInput = z.infer<typeof productBaseSchema>;
