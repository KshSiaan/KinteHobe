import { z } from "zod";
import { metadataTableRowSchema } from "./metadata-table";

const baseVariantSchema = z.object({
  images: z.array(z.unknown()),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  stockQuantity: z.number(),
  sku: z.string().trim().optional(),
  weight: z.string().trim().optional(),
  price: z.number(),
  compareAtPrice: z.number().optional(),
  metadataRows: z.array(metadataTableRowSchema),
});

const colorVariantItemSchema = z.object({
  id: z.string().min(1),
  colorName: z.string().trim().min(1),
  colorValue: z.string().trim().min(1),
  sku: z.string().trim().optional(),
  stockQuantity: z.number(),
  price: z.number(),
  compareAtPrice: z.number().optional(),
  details: z.string().trim().optional(),
  images: z.array(z.unknown()),
  metadataRows: z.array(metadataTableRowSchema),
});

const sizeVariantItemSchema = z.object({
  id: z.string().min(1),
  sizeName: z.string().trim().min(1),
  sizeCode: z.string().trim().optional(),
  sku: z.string().trim().optional(),
  stockQuantity: z.number(),
  price: z.number(),
  compareAtPrice: z.number().optional(),
  weight: z.string().trim().optional(),
  details: z.string().trim().optional(),
  metadataRows: z.array(metadataTableRowSchema),
});

const customOptionSchema = z.object({
  id: z.string().min(1),
  optionName: z.string().trim().min(1),
  optionCode: z.string().trim().optional(),
  sku: z.string().trim().optional(),
  stockQuantity: z.number(),
  price: z.number(),
  compareAtPrice: z.number().optional(),
  weight: z.string().trim().optional(),
  details: z.string().trim().optional(),
  metadataRows: z.array(metadataTableRowSchema),
});

const customVariantGroupSchema = z.object({
  groupId: z.string().min(1),
  groupTitle: z.string().trim().min(1),
  options: z.array(customOptionSchema),
});

export const productCreatePayloadSchema = z.object({
  slug: z.string().trim().min(1),
  category: z.string().trim().min(1),
  status: z.enum(["active", "draft", "archived"]),
  base: baseVariantSchema,
  color: z
    .object({
      enabled: z.boolean(),
      dataset: z.array(colorVariantItemSchema),
    })
    .optional()
    .default({ enabled: false, dataset: [] }),
  size: z
    .object({
      enabled: z.boolean(),
      dataset: z.array(sizeVariantItemSchema),
    })
    .optional()
    .default({ enabled: false, dataset: [] }),
  custom: z
    .object({
      enabled: z.boolean(),
      dataset: z.array(customVariantGroupSchema),
    })
    .optional()
    .default({ enabled: false, dataset: [] }),
});

export type ProductCreatePayload = z.infer<typeof productCreatePayloadSchema>;