import "server-only";
import { getDb, isDatabaseConfigured } from "@/lib/db";

const COLLECTION = "rate_limits";

export const consume = async ({ key, limit, windowMs, now = new Date() }) => {
  if (!isDatabaseConfigured()) return null;

  const db = await getDb();

  if (!db) return null;

  const nextReset = new Date(now.getTime() + windowMs);
  const live = { $gt: ["$resetAt", now] };

  const entry = await db.collection(COLLECTION).findOneAndUpdate(
    { _id: key },
    [
      {
        $set: {
          resetAt: { $cond: [live, "$resetAt", nextReset] },
          count: {
            $cond: [live, { $add: [{ $ifNull: ["$count", 0] }, 1] }, 1],
          },
        },
      },
    ],
    { upsert: true, returnDocument: "after" }
  );

  if (!entry) return null;

  const resetAt = new Date(entry.resetAt).getTime();

  return {
    ok: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    resetAt,
  };
};
