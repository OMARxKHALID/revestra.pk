import "server-only";
import { getDb } from "@/lib/db";

const COLLECTION = "promo_codes";

export const listPromos = async ({ page = 1, perPage = 10 } = {}) => {
  const db = await getDb();

  if (!db) return { promos: [], total: 0, page, perPage };

  const collection = db.collection(COLLECTION);

  const [promos, total] = await Promise.all([
    collection
      .find({}, { projection: { _id: 0 } })
      .sort({ code: 1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .toArray(),
    collection.countDocuments({}),
  ]);

  return { promos, total, page, perPage };
};

export const upsertPromo = async (promo) => {
  const db = await getDb();

  if (!db) return { ok: false, error: "No database is configured" };

  await db.collection(COLLECTION).updateOne(
    { code: promo.code },
    {
      $set: { ...promo, updatedAt: new Date() },
      $setOnInsert: { redemptions: 0, createdAt: new Date() },
    },
    { upsert: true }
  );

  return { ok: true, code: promo.code };
};

export const deletePromo = async (code) => {
  const db = await getDb();

  if (!db) return { ok: false, error: "No database is configured" };

  const { deletedCount } = await db.collection(COLLECTION).deleteOne({ code });

  if (deletedCount === 0) return { ok: false, error: "No such code" };

  return { ok: true };
};
