import { z } from "zod";

export const wishlistSchema = z.object({
  slugs: z.array(z.string().min(1)).max(200),
});
