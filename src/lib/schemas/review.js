import { z } from "zod";

export const REVIEW_STATUS = {
  pending: "pending",
  published: "published",
  hidden: "hidden",
};

export const REVIEW_STATUSES = Object.values(REVIEW_STATUS);

export const reviewSchema = z.object({
  author: z.string().trim().min(2, "Enter your name"),
  email: z.email("Enter a valid email address"),
  rating: z.coerce.number().int().min(1, "Pick a rating").max(5),
  title: z.string().trim().min(3, "Give it a short headline").max(80),
  body: z.string().trim().min(10, "Say a little more").max(1200),
  images: z.array(z.string()).max(3, "Up to three photos").default([]),
});

export const reviewDocSchema = reviewSchema.omit({ images: true }).extend({
  id: z.string().min(1),
  images: z.array(z.string()).max(3).default([]),
  userId: z.string().nullable().default(null),
  verified: z.boolean().default(false),
  status: z.enum(REVIEW_STATUSES).default(REVIEW_STATUS.pending),
  createdAt: z.union([z.string(), z.date()]),
});

export const reviewStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(REVIEW_STATUSES),
});
