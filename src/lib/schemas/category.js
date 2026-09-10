import { z } from "zod";

export const categorySchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Enter a slug")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be kebab-case"),
  name: z.string().trim().min(1, "Enter a name"),
  blurb: z.string().trim().max(160).default(""),
  measurements: z.array(z.string().trim().min(1)).max(8).default([]),
  order: z.int().nonnegative().default(0),
  active: z.boolean().default(true),
});

export const categoryPatchSchema = categorySchema.partial().extend({
  slug: categorySchema.shape.slug.optional(),
});
