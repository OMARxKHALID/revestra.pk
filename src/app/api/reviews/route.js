import { reviewSchema } from "@/lib/schemas/review";
import { createReview, getReviews, hasSettledOrder, summarise } from "@/lib/api/reviews";
import { optionalSession } from "@/lib/session";
import { createRateLimiter, tooManyRequests } from "@/lib/rate-limit";
import requestIp from "@/lib/utils/request-ip";

const limiter = createRateLimiter({ limit: 5, windowMs: 60 * 60 * 1000 });

export const GET = async () => {
  const reviews = await getReviews();

  return Response.json({ reviews, summary: summarise(reviews) });
};

export const POST = async (request) => {
  const gate = limiter.check(requestIp(request));

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

  const review = {
    ...parsed.data,
    email: parsed.data.email.toLowerCase(),
    userId,
    verified: await hasSettledOrder(userId),
    status: "published",
    createdAt: new Date(),
  };

  try {
    const { persisted } = await createReview(review);

    return Response.json(
      { review: { ...review, email: undefined }, persisted },
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
