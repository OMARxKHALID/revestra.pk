import { z } from "zod";

export const promoSchema = z.object({
  code: z.string().trim().toUpperCase().min(3).max(24),
  kind: z.enum(["percent", "fixed", "free_shipping"]),
  value: z.number().nonnegative(),
  minSubtotalCents: z.int().nonnegative().default(0),
  active: z.boolean().default(true),
  startsAt: z.union([z.string(), z.date()]).nullable().default(null),
  endsAt: z.union([z.string(), z.date()]).nullable().default(null),
  maxRedemptions: z.int().positive().nullable().default(null),
  redemptions: z.int().nonnegative().default(0),
});

export const promoRequestSchema = z.object({
  code: z.string().trim().min(1, "Enter a code").max(24),
  subtotalCents: z.int().nonnegative(),
  rateId: z.string().optional(),
});
