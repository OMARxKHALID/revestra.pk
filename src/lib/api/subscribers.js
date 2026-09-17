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

export const unsubscribe = async (email) => {
  const db = await getDb();

  if (!db) return { ok: false };

  const { deletedCount } = await db
    .collection(COLLECTION)
    .deleteOne({ email: String(email).trim().toLowerCase() });

  return { ok: true, removed: deletedCount > 0 };
};

export const isSubscribed = async (email) => {
  const db = await getDb();

  if (!db) return false;

  const found = await db
    .collection(COLLECTION)
    .findOne(
      { email: String(email).trim().toLowerCase() },
      { projection: { _id: 1 } }
    );

  return Boolean(found);
};

export const allSubscriberEmails = async (limit = 5000) => {
  const db = await getDb();

  if (!db) return [];

  const rows = await db
    .collection(COLLECTION)
    .find({}, { projection: { _id: 0, email: 1 } })
    .limit(limit)
    .toArray();

  return rows.map(({ email }) => email);
};
