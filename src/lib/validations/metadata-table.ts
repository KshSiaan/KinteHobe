import { z } from "zod";

export const metadataTableRowSchema = z.object({
  id: z.string().min(1),
  name: z
    .string()
    .trim()
    .max(120, "Name must be at most 120 characters")
    .or(z.literal("")),
  description: z
    .string()
    .trim()
    .max(300, "Description must be at most 300 characters")
    .or(z.literal("")),
});

export const metadataTableSchema = z
  .array(metadataTableRowSchema)
  .max(20, "You can add up to 20 rows")
  .default([]);

export type MetadataTableRowInput = z.input<typeof metadataTableRowSchema>;
export type MetadataTableRow = z.infer<typeof metadataTableRowSchema>;
