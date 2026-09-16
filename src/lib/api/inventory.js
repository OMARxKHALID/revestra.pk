import "server-only";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { DEFAULT_COMMERCE } from "@/lib/shipping";
import { invalidateCatalogue } from "@/lib/api/catalogue-cache";

const COLLECTION = "products";

const HOLD_MINUTES = DEFAULT_COMMERCE.holdMinutes;

const sellableFilter = (slug, now) => ({
  slug,
  status: { $ne: "sold" },
  $or: [{ status: "available" }, { reservedUntil: { $lte: now } }],
});

export const releaseStock = async (lines, reference = null) => {
  if (!isDatabaseConfigured()) return { released: false };

  const db = await getDb();

  if (!db) return { released: false };

  const collection = db.collection(COLLECTION);

  for (const line of lines) {
    const filter = reference
      ? { slug: line.slug, status: { $in: ["reserved", "sold"] }, reservedBy: reference }
      : { slug: line.slug, status: "reserved" };

    const result = await collection.updateOne(filter, {
      $set: {
        status: "available",
        reservedUntil: null,
        reservedBy: null,
        soldAt: null,
      },
    });

    if (reference && result.matchedCount === 0)
      console.info(
        `[inventory] ${line.slug} is no longer held by ${reference} — leaving it alone`
      );
  }

  invalidateCatalogue();

  return { released: true };
};

export const reserveStock = async (
  lines,
  { reference = null, holdFor = null } = {}
) => {
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
      $set: { status: "reserved", reservedUntil: until, reservedBy: reference },
    });

    if (result.modifiedCount === 0) {
      await releaseStock(taken, reference);

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

export const markSold = async (lines, reference = null) => {
  if (!isDatabaseConfigured()) return { sold: false };

  const db = await getDb();

  if (!db) return { sold: false };

  const collection = db.collection(COLLECTION);
  const now = new Date();
  const contested = [];

  for (const line of lines) {
    const filter = { slug: line.slug, status: { $ne: "sold" } };

    if (reference) filter.reservedBy = reference;

    const result = await collection.updateOne(filter, {
      $set: { status: "sold", soldAt: now, reservedUntil: null },
    });

    if (result.matchedCount === 0) contested.push(line.slug);
  }

  if (contested.length > 0)
    console.error(
      `[inventory] could not mark sold for ${reference}: ${contested.join(", ")} — reconcile by hand`
    );

  invalidateCatalogue();

  return { sold: contested.length === 0, contested };
};
