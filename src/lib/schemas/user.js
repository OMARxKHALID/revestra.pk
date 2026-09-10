import { z } from "zod";

export { ROLE, ROLES } from "@/lib/roles";

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

