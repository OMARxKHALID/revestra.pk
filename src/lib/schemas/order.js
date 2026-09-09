import { z } from "zod";

export const shippingSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  email: z.email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^(?:\+92|0)3\d{2}[\s-]?\d{7}$/, "Enter a Pakistani mobile number"),
  address: z.string().trim().min(4, "Enter your street address"),
  apartment: z.string().trim().max(80).optional().or(z.literal("")),
  city: z.string().trim().min(2, "Enter your city"),
  postalCode: z.string().trim().min(3, "Enter your postal code"),
  country: z.string().trim().min(2, "Enter your country"),
});

const orderLineSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  size: z.string().min(1).nullable(),
  quantity: z.int().positive().max(99),
  unitCents: z.int().nonnegative(),
});

export const PAYMENT_METHODS = ["jazzcash", "easypaisa", "card", "cod"];

export const orderSchema = z.object({
  shipping: shippingSchema,
  items: z.array(orderLineSchema).min(1, "Your cart is empty"),
  promoCode: z.string().trim().max(24).optional().or(z.literal("")),
  rateId: z.enum(["standard", "express"]).default("standard"),
  method: z.enum(PAYMENT_METHODS).default("cod"),
});
