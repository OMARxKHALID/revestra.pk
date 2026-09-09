import { z } from "zod";

export const signInSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Passwords are at least 8 characters"),
});

export const signUpSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your name"),
    email: z.email("Enter a valid email address"),
    password: z.string().min(8, "Use at least 8 characters"),
    confirm: z.string(),
  })
  .refine((values) => values.password === values.confirm, {
    path: ["confirm"],
    message: "Those passwords do not match",
  });

export const userDocSchema = z.object({
  email: z.email(),
  name: z.string().min(1),
  passwordHash: z.string().min(1),
  role: z.enum(["customer", "admin"]).default("customer"),
  wishlist: z.array(z.string()).default([]),
  emailVerified: z.date().nullable().default(null),
  createdAt: z.date(),
  updatedAt: z.date(),
});
