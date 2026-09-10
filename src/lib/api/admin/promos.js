import "server-only";
import { getDb } from "@/lib/db";

const COLLECTION = "promo_codes";

export const listPromos = async () => {
  const db = await getDb();

  if (!db) return [];

  return db
    .collection(COLLECTION)
    .find({}, { projection: { _id: 0 } })
    .sort({ code: 1 })
    .toArray();
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
