import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(80, "Category name must be at most 80 characters"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Category slug must be at least 2 characters")
    .max(80, "Category slug must be at most 80 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be at most 500 characters"),
  isActive: z.boolean(),
  metaTitle: z
    .string()
    .trim()
    .min(10, "Metadata title must be at least 10 characters")
    .max(60, "Metadata title must be at most 60 characters"),
  metaDescription: z
    .string()
    .trim()
    .min(50, "Metadata description must be at least 50 characters")
    .max(160, "Metadata description must be at most 160 characters"),
});

export type CategoryInput = z.infer<typeof categorySchema>;
