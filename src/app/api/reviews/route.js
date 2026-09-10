import { reviewDocSchema, reviewSchema } from "@/lib/schemas/review";
import { storeImages } from "@/lib/api/review-images";
import { createReview, getReviews, hasSettledOrder, summarise } from "@/lib/api/reviews";
import { REVIEW_STATUS } from "@/lib/schemas/review";
import { optionalSession } from "@/lib/session";
import { createLimiter, tooManyRequests } from "@/lib/rate-limit";
import RATE_LIMITS from "@/lib/rate-limits";
import requestIp from "@/lib/utils/request-ip";
import { sameOrigin, badOrigin } from "@/lib/api/origin";

const limiter = createLimiter(RATE_LIMITS.review);

export const GET = async () => {
  const reviews = await getReviews();

  return Response.json({ reviews, summary: summarise(reviews) });
};

export const POST = async (request) => {
  if (!sameOrigin(request)) return badOrigin();

  const gate = await limiter.check(requestIp(request));

  if (!gate.ok) return tooManyRequests(gate.resetAt);

  let payload;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Malformed request" }, { status: 400 });
  }

  const parsed = reviewSchema.safeParse(payload);

  if (!parsed.success)
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid review" },
      { status: 422 }
    );

  const session = await optionalSession();
  const userId = session?.user?.id ?? null;

  const stored = await storeImages(parsed.data.images);

  if (!stored.ok)
    return Response.json({ error: stored.error }, { status: 422 });

  const { images: _submitted, ...fields } = parsed.data;

  const review = reviewDocSchema.parse({
    id: crypto.randomUUID(),
    ...fields,
    images: stored.ids,
    email: parsed.data.email.toLowerCase(),
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
