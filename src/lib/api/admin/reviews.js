import "server-only";
import { getDb } from "@/lib/db";

const COLLECTION = "reviews";

export const listReviews = async ({ status = "" } = {}) => {
  const db = await getDb();

  if (!db) return [];

  const filter = status ? { status } : {};

  return db
    .collection(COLLECTION)
    .find(filter, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();
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
