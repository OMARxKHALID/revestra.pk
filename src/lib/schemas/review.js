import { z } from "zod";

export const reviewSchema = z.object({
  author: z.string().trim().min(2, "Enter your name"),
  email: z.email("Enter a valid email address"),
  rating: z.coerce.number().int().min(1, "Pick a rating").max(5),
  title: z.string().trim().min(3, "Give it a short headline").max(80),
  body: z.string().trim().min(10, "Say a little more").max(1200),
});

export const reviewDocSchema = reviewSchema.extend({
  userId: z.string().nullable().default(null),
  verified: z.boolean().default(false),
  status: z.enum(["published", "hidden"]).default("published"),
  createdAt: z.union([z.string(), z.date()]),
});
