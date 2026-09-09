import "server-only";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { invalidateCatalogue } from "@/lib/api/products";

const COLLECTION = "products";

export const HOLD_MINUTES = 15;

const sellableFilter = (slug, now) => ({
  slug,
  status: { $ne: "sold" },
  $or: [{ status: "available" }, { reservedUntil: { $lte: now } }],
});

export const releaseStock = async (lines) => {
  if (!isDatabaseConfigured()) return { released: false };

  const db = await getDb();

  if (!db) return { released: false };

  const collection = db.collection(COLLECTION);

  for (const line of lines)
    await collection.updateOne(
      { slug: line.slug, status: { $ne: "sold" } },
      { $set: { status: "available", reservedUntil: null, reservedBy: null } }
    );

  invalidateCatalogue();

  return { released: true };
};

export const reserveStock = async (lines, { holdFor = null } = {}) => {
  if (!isDatabaseConfigured()) return { ok: true, reserved: false };

  const db = await getDb();

  if (!db) return { ok: true, reserved: false };

  const collection = db.collection(COLLECTION);
  const now = new Date();
  const until = holdFor
    ? new Date(now.getTime() + holdFor * 60 * 1000)
    : new Date(now.getTime() + HOLD_MINUTES * 60 * 1000);

  const taken = [];

  for (const line of lines) {
    const result = await collection.updateOne(sellableFilter(line.slug, now), {
      $set: { status: "reserved", reservedUntil: until },
    });

    if (result.modifiedCount === 0) {
      await releaseStock(taken);

      return {
        ok: false,
        reserved: false,
        slug: line.slug,
        error: `${line.name} has already gone`,
      };
    }

    taken.push(line);
  }

  invalidateCatalogue();

  return { ok: true, reserved: true, reservedUntil: until };
};

export const markSold = async (lines) => {
  if (!isDatabaseConfigured()) return { sold: false };

  const db = await getDb();

  if (!db) return { sold: false };

  const now = new Date();

  for (const line of lines)
    await db
      .collection(COLLECTION)
      .updateOne(
        { slug: line.slug },
        { $set: { status: "sold", soldAt: now, reservedUntil: null } }
      );

  invalidateCatalogue();

  return { sold: true };
};
