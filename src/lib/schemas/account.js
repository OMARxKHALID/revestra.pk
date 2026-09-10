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
