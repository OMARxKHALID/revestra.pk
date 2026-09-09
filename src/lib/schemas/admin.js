import { z } from "zod";
import {
  productBaseSchema,
  privateProductSchema,
  refineProduct,
} from "@/lib/schemas/product";

export const ORDER_STATUSES = [
  "pending_payment",
  "received",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "failed",
];

export const SETTABLE_ORDER_STATUSES = [
  "received",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export const adminProductSchema = productBaseSchema
  .extend(privateProductSchema.shape)
  .superRefine(refineProduct);

export const adminProductPatchSchema = productBaseSchema
  .extend(privateProductSchema.shape)
  .partial()
  .superRefine(refineProduct);

export const orderStatusSchema = z.object({
  status: z.enum(SETTABLE_ORDER_STATUSES),
  note: z.string().trim().max(200).optional().or(z.literal("")),
});

export const productStatusSchema = z.object({
  status: z.enum(["available", "reserved", "sold"]),
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

export const reviewStatusSchema = z.object({
  status: z.enum(["published", "hidden"]),
});

export const listQuerySchema = z.object({
  q: z.string().trim().max(80).default(""),
  status: z.string().trim().max(24).default(""),
  category: z.string().trim().max(24).default(""),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(25),
});
