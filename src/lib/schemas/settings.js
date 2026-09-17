import { z } from "zod";
import { whatsappNumber } from "@/lib/utils/whatsapp";
import { SHIPPING_RATE_IDS } from "@/lib/shipping";
import { PAYMENT_METHODS } from "@/lib/schemas/order";

export const SOCIAL_NETWORKS = [
  "instagram",
  "linkedin",
  "facebook",
  "tiktok",
  "youtube",
  "x",
];

const socialSchema = z.object({
  name: z.enum(SOCIAL_NETWORKS),
  label: z.string().trim().min(1, "Give the link a label"),
  href: z.url("Enter a full URL, including https://"),
});

const tickerItemSchema = z
  .object({
    icon: z.enum(["globe", "clock", "shield"]).default("globe"),
    text: z.string().trim().max(120).default(""),
  })
  .refine((entry) => entry.icon !== "globe" || entry.text.length > 0, {
    path: ["text"],
    message: "A globe row needs a message",
  });

const shippingRateSchema = z.object({
  id: z.enum(SHIPPING_RATE_IDS),
  label: z.string().trim().min(1, "Give the rate a name"),
  note: z.string().trim().max(80).default(""),
  cents: z.coerce.number().int().min(0, "A rate cannot be negative"),
});

const commerceSchema = z.object({
  freeShippingThresholdCents: z.coerce
    .number()
    .int()
    .min(0, "A threshold cannot be negative"),
  taxRate: z.coerce
    .number()
    .min(0, "A tax rate cannot be negative")
    .max(1, "Enter the tax rate as a fraction, so 0.17 for 17%"),
  holdMinutes: z.coerce
    .number()
    .int()
    .min(5, "Hold stock for at least 5 minutes")
    .max(240, "Hold stock for at most 4 hours"),
  shippingRates: z
    .array(shippingRateSchema)
    .min(1, "Keep at least one shipping rate"),
});

export const policySchema = z.object({
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, digits and hyphens"),
  title: z.string().trim().min(1, "Give the policy a title"),
  body: z.string().trim().min(1, "Write the policy").max(6000),
});

export const settingsSchema = z.object({
  name: z.string().trim().min(1, "The shop needs a name"),
  legalName: z.string().trim().min(1, "Enter the legal name"),
  tagline: z.string().trim().min(1, "Enter a tagline"),
  description: z.string().trim().min(1, "Enter a description").max(300),
  email: z.email("Enter a valid contact address"),
  phone: z.string().trim().max(40).default(""),
  whatsapp: z
    .string()
    .trim()
    .max(40)
    .refine(
      (value) => value === "" || whatsappNumber(value) !== null,
      "Enter a full mobile number, like +92 300 1234567"
    )
    .default(""),
  addressLine: z.string().trim().max(120).default(""),
  city: z.string().trim().min(1, "Enter a city"),
  hours: z.string().trim().min(1, "Enter opening hours"),
  socials: z.array(socialSchema).max(6).default([]),
  ticker: z.array(tickerItemSchema).max(6).default([]),
  commerce: commerceSchema,
  enabledMethods: z.array(z.enum(PAYMENT_METHODS)).default(PAYMENT_METHODS),
  paymentNotes: z
    .object(
      Object.fromEntries(
        PAYMENT_METHODS.map((method) => [
          method,
          z.string().trim().max(60).default(""),
        ])
      )
    )
    .default({}),
  signupOpen: z.boolean().default(true),
  policies: z.array(policySchema).max(8).default([]),
});
