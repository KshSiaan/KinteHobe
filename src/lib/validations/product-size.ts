import { z } from "zod";
import { metadataTableSchema } from "@/lib/validations/metadata-table";

export const productSizeVariantSchema = z.object({
  id: z.string().min(1),
  sizeName: z
    .string()
    .trim()
    .min(1, "Size name is required")
    .max(20, "Size name must be at most 20 characters"),
  sizeCode: z
    .string()
    .trim()
    .max(20, "Size code must be at most 20 characters")
    .or(z.literal(""))
    .transform((value) => (value === "" ? undefined : value)),
  sku: z
    .string()
    .trim()
    .max(64, "SKU must be at most 64 characters")
    .or(z.literal(""))
    .transform((value) => (value === "" ? undefined : value)),
  stockQuantity: z
    .string()
    .trim()
    .min(1, "Stock quantity is required")
    .regex(/^\d+$/, "Stock quantity must be a non-negative integer")
    .transform(Number),
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
  weight: z
    .string()
    .trim()
    .regex(/^$|^(?:\d+|\d+\.\d{1,2})$/, "Weight must be a valid number")
    .transform((value) => (value === "" ? undefined : Number(value))),
  details: z
    .string()
    .trim()
    .max(500, "Details must be at most 500 characters")
    .or(z.literal(""))
    .transform((value) => (value === "" ? undefined : value)),
  metadataRows: metadataTableSchema,
});

export type ProductSizeVariantFormInput = z.input<
  typeof productSizeVariantSchema
>;
export type ProductSizeVariantInput = z.infer<typeof productSizeVariantSchema>;
