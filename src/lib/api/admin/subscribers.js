import "server-only";
import { getDb } from "@/lib/db";

const COLLECTION = "subscribers";

export const listSubscribers = async (limit = 500) => {
  const db = await getDb();

  if (!db) return [];

  return db
    .collection(COLLECTION)
    .find({}, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
};

export const countSubscribers = async () => {
  const db = await getDb();

  if (!db) return 0;

  return db.collection(COLLECTION).countDocuments();
};
