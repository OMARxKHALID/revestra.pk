import { z } from "zod";
import { SETTABLE_ORDER_STATUSES } from "@/lib/schemas/order";
import {
  AVAILABILITY,
  CONDITIONS,
  SIZE_SYSTEMS,
  productBaseSchema,
  privateProductSchema,
  refineProduct,
  refineWithTemplates,
} from "@/lib/schemas/product";

export {
  ORDER_STATUS,
  ORDER_STATUSES,
  SETTABLE_ORDER_STATUSES,
} from "@/lib/schemas/order";

export const adminProductSchema = productBaseSchema
  .extend(privateProductSchema.shape)
  .superRefine(refineProduct);

export const adminProductPatchSchema = productBaseSchema
  .extend(privateProductSchema.shape)
  .partial()
  .superRefine(refineProduct);

const required = (label) => z.string().trim().min(1, `${label} is required`);

const rupees = (label) =>
  required(label).refine(
    (value) => Number.isFinite(Number(value)) && Number(value) >= 0,
    `${label} must be a number`
  );

const optionalRupees = (label) =>
  z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" || (Number.isFinite(Number(value)) && Number(value) >= 0),
      `${label} must be a number`
    );

const toCents = (value) =>
  value === "" || value === null || value === undefined
    ? null
    : Math.round(Number(value) * 100);

const toLines = (value) =>
  String(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

export const makeAdminProductFormSchema = (templates) =>
  adminProductFormBase.superRefine(refineWithTemplates(templates));

const adminProductFormBase = z
  .object({
    sku: required("SKU"),
    slug: required("Slug").regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be kebab-case"
    ),
    name: required("Name"),
    tagline: required("Tagline"),
    brand: required("Brand"),
    category: z.string().trim().min(1, "Pick a category"),
    condition: z.enum(CONDITIONS),
    sizeSystem: z.enum(SIZE_SYSTEMS),
    sizeLabel: required("Size label"),
    status: z.enum(AVAILABILITY),
    priceCents: rupees("List price"),
    salePriceCents: optionalRupees("Sale price"),
    costCents: rupees("Cost"),
    lot: z.string().trim(),
    image: required("Main image").startsWith(
      "/assets/",
      "Image paths start with /assets/"
    ),
    images: z.string(),
    description: required("Description"),
    conditionNotes: z.string(),
    details: required("Details"),
    measurements: z.record(z.string(), z.string()),
  })
  .transform((values) => ({
    sku: values.sku,
    slug: values.slug,
    name: values.name,
    tagline: values.tagline,
    brand: values.brand,
    category: values.category,
    condition: values.condition,
    sizeSystem: values.sizeSystem,
    sizeLabel: values.sizeLabel,
    status: values.status,
    priceCents: toCents(values.priceCents) ?? 0,
    salePriceCents: toCents(values.salePriceCents),
    costCents: toCents(values.costCents) ?? 0,
    lot: values.lot || null,
    image: values.image,
    images: toLines(values.images),
    description: values.description,
    conditionNotes: values.conditionNotes.trim() || null,
    details: toLines(values.details),
    measurements: Object.fromEntries(
      Object.entries(values.measurements).filter(([, value]) => value !== "")
    ),
  }))
;

export const adminProductFormSchema = adminProductFormBase.superRefine(
  refineProduct
);

export const orderStatusSchema = z.object({
  status: z.enum(SETTABLE_ORDER_STATUSES),
  note: z.string().trim().max(200).optional().or(z.literal("")),
  courier: z.string().trim().max(40).optional().or(z.literal("")),
  trackingNumber: z.string().trim().max(60).optional().or(z.literal("")),
});


export const adminPromoSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(3, "Codes are at least 3 characters")
    .max(24),
  kind: z.enum(["percent", "fixed", "free_shipping"]),
  value: z.number().nonnegative(),
  minSubtotalCents: z.int().nonnegative().default(0),
  active: z.boolean().default(true),
  startsAt: z.string().nullable().default(null),
  endsAt: z.string().nullable().default(null),
  maxRedemptions: z.int().positive().nullable().default(null),
});


export const listQuerySchema = z.object({
  q: z.string().trim().max(80).default(""),
  status: z.string().trim().max(24).default(""),
  category: z.string().trim().max(24).default(""),
  attention: z.string().trim().max(1).default(""),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(10),
});

export const staleReleaseSchema = z.object({
  minutes: z.coerce
    .number()
    .int()
    .min(5, "Release holds no sooner than 5 minutes")
    .max(10080)
    .default(60),
});
