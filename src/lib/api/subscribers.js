import "server-only";
import { getDb } from "@/lib/db";

const COLLECTION = "subscribers";

export const subscribe = async (email) => {
  const db = await getDb();

  if (!db) return { ok: false, persisted: false };

  await db
    .collection(COLLECTION)
    .updateOne(
      { email },
      { $setOnInsert: { email, createdAt: new Date() } },
      { upsert: true }
    );

  return { ok: true, persisted: true };
};

export const listSubscribers = async ({ page = 1, perPage = 10 } = {}) => {
  const db = await getDb();

  if (!db) return { subscribers: [], total: 0, page, perPage };

  const collection = db.collection(COLLECTION);

  const [subscribers, total] = await Promise.all([
    collection
      .find({}, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .toArray(),
    collection.countDocuments({}),
  ]);

  return { subscribers, total, page, perPage };
};
