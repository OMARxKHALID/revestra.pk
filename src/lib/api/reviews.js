import "server-only";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { MOCK_REVIEWS } from "@/lib/reviews";

const COLLECTION = "reviews";

export const getReviews = async (limit = 50) => {
  if (!isDatabaseConfigured()) return MOCK_REVIEWS;

  try {
    const db = await getDb();

    if (!db) return MOCK_REVIEWS;

    const stored = await db
      .collection(COLLECTION)
      .find({ status: "published" }, { projection: { _id: 0, email: 0 } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return stored.length > 0 ? stored : MOCK_REVIEWS;
  } catch (error) {
    console.warn(`[reviews] read failed: ${error.message}`);
    return MOCK_REVIEWS;
  }
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

export const getReviewSummary = async () => summarise(await getReviews());

export const hasSettledOrder = async (userId) => {
  if (!userId || !isDatabaseConfigured()) return false;

  const db = await getDb();

  if (!db) return false;

  const order = await db.collection("orders").findOne({
    userId,
    status: { $in: ["received", "processing", "shipped", "delivered"] },
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
