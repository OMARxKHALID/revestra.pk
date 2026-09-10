import "server-only";
import { FULFILLED_ORDER_STATUSES } from "@/lib/schemas/order";
import { REVIEW_STATUS } from "@/lib/schemas/review";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { MOCK_REVIEWS } from "@/lib/reviews";

const COLLECTION = "reviews";

export const getReviews = async (limit = 50) => {
  if (!isDatabaseConfigured()) return MOCK_REVIEWS;

  const db = await getDb();

  if (!db) return MOCK_REVIEWS;

  return db
    .collection(COLLECTION)
    .find(
      { status: REVIEW_STATUS.published },
      { projection: { _id: 0, email: 0 } }
    )
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
};

export const summarise = (reviews) => {
  if (reviews.length === 0) return { count: 0, average: null, histogram: {} };

  const histogram = reviews.reduce(
    (counts, review) => ({
      ...counts,
      [review.rating]: (counts[review.rating] ?? 0) + 1,
    }),
    {}
  );

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);

  return {
    count: reviews.length,
    average: Math.round((total / reviews.length) * 10) / 10,
    histogram,
  };
};


export const getReviewHighlights = async (limit = 3) => {
  const reviews = await getReviews();

  return {
    summary: summarise(reviews),
    reviews: reviews.slice(0, limit),
  };
};

export const hasSettledOrder = async (userId) => {
  if (!userId || !isDatabaseConfigured()) return false;

  const db = await getDb();

  if (!db) return false;

  const order = await db.collection("orders").findOne({
    userId,
    status: { $in: FULFILLED_ORDER_STATUSES },
  });

  return Boolean(order);
};

export const createReview = async (review) => {
  if (!isDatabaseConfigured()) return { persisted: false };

  const db = await getDb();

  if (!db) return { persisted: false };

  await db.collection(COLLECTION).insertOne(review);

  return { persisted: true };
};
