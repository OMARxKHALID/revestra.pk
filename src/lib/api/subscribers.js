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
