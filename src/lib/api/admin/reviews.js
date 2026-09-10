import "server-only";
import { getDb } from "@/lib/db";

const COLLECTION = "reviews";

export const listReviews = async ({ status = "", page = 1, perPage = 10 } = {}) => {
  const db = await getDb();

  if (!db) return { reviews: [], total: 0, page, perPage };

  const filter = status ? { status } : {};
  const collection = db.collection(COLLECTION);

  const [reviews, total] = await Promise.all([
    collection
      .find(filter, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .toArray(),
    collection.countDocuments(filter),
  ]);

  return { reviews, total, page, perPage };
};

export const setReviewStatus = async ({ id, status }) => {
  const db = await getDb();

  if (!db) return { ok: false, error: "No database is configured" };

  const result = await db
    .collection(COLLECTION)
    .updateOne({ id }, { $set: { status, updatedAt: new Date() } });

  if (result.matchedCount === 0) return { ok: false, error: "No such review" };

  return { ok: true };
};
