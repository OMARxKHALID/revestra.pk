import "server-only";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { promoSchema } from "@/lib/schemas/promo";
import { MOCK_PROMOS } from "@/lib/promos";

const COLLECTION = "promo_codes";

const fromStatic = (code) =>
  MOCK_PROMOS.find((promo) => promo.code === code) ?? null;

export const getPromoByCode = async (raw) => {
  const code = raw.trim().toUpperCase();

  if (!isDatabaseConfigured()) return fromStatic(code);

  try {
    const db = await getDb();

    if (!db) return fromStatic(code);

    const document = await db
      .collection(COLLECTION)
      .findOne({ code }, { projection: { _id: 0 } });

    if (!document) return fromStatic(code);

    return promoSchema.parse(document);
  } catch (error) {
    console.warn(`[promos] lookup failed for ${code}: ${error.message}`);
    return fromStatic(code);
  }
};

export const recordRedemption = async (code) => {
  if (!isDatabaseConfigured()) return;

  const db = await getDb();

  if (!db) return;

  await db.collection(COLLECTION).updateOne({ code }, { $inc: { redemptions: 1 } });
};
