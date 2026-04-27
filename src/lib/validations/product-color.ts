import { z } from "zod";
import { metadataTableSchema } from "@/lib/validations/metadata-table";

export const productColorVariantSchema = z.object({
  id: z.string().min(1),
  colorName: z
    .string()
    .trim()
    .min(2, "Color name must be at least 2 characters")
    .max(50, "Color name must be at most 50 characters"),
  colorValue: z.string().trim().min(1, "Color value is required"),
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
  details: z
    .string()
    .trim()
    .max(500, "Details must be at most 500 characters")
    .or(z.literal(""))
    .transform((value) => (value === "" ? undefined : value)),
  images: z
    .array(z.instanceof(File))
    .min(1, "At least one image is required for this color")
    .max(8, "You can upload up to 8 images per color"),
  metadataRows: metadataTableSchema,
});

export const productColorVariantsSchema = z.object({
  variants: z
    .array(productColorVariantSchema)
    .min(1, "Add at least one color variant"),
});

export type ProductColorVariantFormInput = z.input<
  typeof productColorVariantSchema
>;
export type ProductColorVariantInput = z.infer<typeof productColorVariantSchema>;
