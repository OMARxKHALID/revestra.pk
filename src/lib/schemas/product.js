import { z } from "zod";

export const CATEGORIES = [
  "Jeans",
  "Pants",
  "Shirts",
  "Jackets",
  "Shoes",
  "Belts",
  "Accessories",
];

export const SIZE_SYSTEMS = ["alpha", "waist", "shoe", "length", "one-size"];

export const CONDITIONS = ["Excellent", "Good", "Fair", "Worn"];

export const AVAILABILITY = ["available", "reserved", "sold"];

export const MEASUREMENT_TEMPLATES = {
  Jeans: ["Waist", "Inseam", "Rise", "Leg opening"],
  Pants: ["Waist", "Inseam", "Rise", "Leg opening"],
  Shirts: ["Pit to pit", "Length", "Shoulder", "Sleeve"],
  Jackets: ["Pit to pit", "Length", "Shoulder", "Sleeve"],
  Shoes: ["Insole length"],
  Belts: ["Total length", "Fits waist", "Width"],
  Accessories: [],
};

export const productBaseSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be kebab-case"),
  sku: z.string().min(1),
  name: z.string().min(1),
  tagline: z.string().min(1),
  brand: z.string().min(1),
  category: z.enum(CATEGORIES),
  sizeSystem: z.enum(SIZE_SYSTEMS),
  sizeLabel: z.string().min(1),
  measurements: z.record(z.string(), z.string()),
  condition: z.enum(CONDITIONS),
  conditionNotes: z.string().nullable().default(null),
  priceCents: z.int().nonnegative(),
  salePriceCents: z.int().nonnegative().nullable().default(null),
  image: z.string().startsWith("/assets/"),
  images: z.array(z.string().startsWith("/assets/")).default([]),
  description: z.string().min(1),
  details: z.array(z.string().min(1)).min(1),
  status: z.enum(AVAILABILITY).default("available"),
  reservedUntil: z.union([z.string(), z.date()]).nullable().default(null),
  soldAt: z.union([z.string(), z.date()]).nullable().default(null),
});

export const refineProduct = (product, ctx) => {
  if (
    product.salePriceCents !== null &&
    product.salePriceCents !== undefined &&
    product.priceCents !== undefined &&
    product.salePriceCents > product.priceCents
  )
    ctx.addIssue({
      code: "custom",
      path: ["salePriceCents"],
      message: "a sale price cannot exceed the list price",
    });

  if (product.category === undefined || product.measurements === undefined)
    return;

  const expected = MEASUREMENT_TEMPLATES[product.category] ?? [];
  const missing = expected.filter((label) => !product.measurements[label]);

  if (missing.length)
    ctx.addIssue({
      code: "custom",
      path: ["measurements"],
      message: `${product.category} needs ${missing.join(", ")}`,
    });
};

export const productSchema = productBaseSchema.superRefine(refineProduct);

export const privateProductSchema = z.object({
  costCents: z.int().nonnegative(),
  lot: z.string().nullable().default(null),
});

export const intakeSchema = z.intersection(productSchema, privateProductSchema);

export const productsSchema = z.array(productSchema).min(1);

export const PRIVATE_FIELDS = ["costCents", "lot"];

export const toPublicProduct = ({ costCents, lot, ...product }) => product;
