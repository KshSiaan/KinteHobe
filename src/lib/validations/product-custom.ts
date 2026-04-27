import { z } from "zod";
import { metadataTableSchema } from "@/lib/validations/metadata-table";

export const productCustomVariantSchema = z.object({
  id: z.string().min(1),
  optionName: z
    .string()
    .trim()
    .min(1, "Option value is required")
    .max(50, "Option value must be at most 50 characters"),
  optionCode: z
    .string()
    .trim()
    .max(30, "Option code must be at most 30 characters")
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

export type ProductCustomVariantFormInput = z.input<
  typeof productCustomVariantSchema
>;
export type ProductCustomVariantInput = z.infer<
  typeof productCustomVariantSchema
>;
