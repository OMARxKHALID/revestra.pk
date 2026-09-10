import { reviewDocSchema, reviewSchema } from "@/lib/schemas/review";
import { storeImages } from "@/lib/api/review-images";
import { createReview, getReviews, hasSettledOrder, summarise } from "@/lib/api/reviews";
import { REVIEW_STATUS } from "@/lib/schemas/review";
import { optionalSession } from "@/lib/session";
import { createLimiter } from "@/lib/rate-limit";
import RATE_LIMITS from "@/lib/rate-limits";
import { guardRequest } from "@/lib/api/request";

const limiter = createLimiter(RATE_LIMITS.review);

export const GET = async () => {
  const reviews = await getReviews();

  return Response.json({ reviews, summary: summarise(reviews) });
};

export const POST = async (request) => {
  const gated = await guardRequest(request, {
    limiter,
    schema: reviewSchema,
    fallback: "Invalid review",
  });

  if (gated.response) return gated.response;

  const session = await optionalSession();
  const userId = session?.user?.id ?? null;

  const stored = await storeImages(gated.data.images);

  if (!stored.ok)
    return Response.json({ error: stored.error }, { status: 422 });

  const { images: _submitted, ...fields } = gated.data;

  const review = reviewDocSchema.parse({
    id: crypto.randomUUID(),
    ...fields,
    images: stored.ids,
    email: gated.data.email.toLowerCase(),
    userId,
    verified: await hasSettledOrder(userId),
    status: REVIEW_STATUS.pending,
    createdAt: new Date(),
  });

  try {
    const { persisted } = await createReview(review);

    return Response.json(
      {
        review: { ...review, email: undefined },
        persisted,
        pending: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(`[reviews] could not store a review: ${error.message}`);

    return Response.json(
      { error: "We could not save your review. Try again shortly." },
      { status: 503 }
    );
  }
};
