import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  email: z.email("Enter a valid email address"),
});

export const passwordSchema = z
  .object({
    current: z.string().min(1, "Enter your current password"),
    next: z.string().min(8, "Use at least 8 characters"),
    confirm: z.string(),
  })
  .refine((values) => values.next === values.confirm, {
    path: ["confirm"],
    message: "Those passwords do not match",
  });

export const savedAddressSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
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

export const newsletterPreferenceSchema = z.object({
  subscribed: z.boolean(),
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Enter your password"),
});

export const resetRequestSchema = z.object({
  email: z.email("Enter a valid email address"),
});

export const resetConfirmSchema = z
  .object({
    email: z.email("Enter a valid email address"),
    code: z.string().trim().regex(/^\d{6}$/, "Enter the six-digit code"),
    password: z.string().min(8, "Use at least 8 characters"),
    confirm: z.string(),
  })
  .refine((values) => values.password === values.confirm, {
    path: ["confirm"],
    message: "Those passwords do not match",
  });
