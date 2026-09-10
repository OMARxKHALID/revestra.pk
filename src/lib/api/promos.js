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

  const db = await getDb();

  if (!db) return fromStatic(code);

  const document = await db
    .collection(COLLECTION)
    .findOne({ code }, { projection: { _id: 0 } });

  if (!document) return null;

  return promoSchema.parse(document);
};

const claimRedemption = async (db, reference, redeemed) => {
  if (!reference) return true;

  const result = await db
    .collection("orders")
    .updateOne(
      { reference, promoRedeemed: redeemed ? { $ne: true } : true },
      { $set: { promoRedeemed: redeemed } }
    );

  return result.modifiedCount > 0;
};

export const recordRedemption = async (code, reference = null) => {
  if (!isDatabaseConfigured()) return;

  const db = await getDb();

  if (!db) return;
  if (!(await claimRedemption(db, reference, true))) return;

  await db
    .collection(COLLECTION)
    .updateOne({ code }, { $inc: { redemptions: 1 } });
};

export const releaseRedemption = async (code, reference = null) => {
  if (!isDatabaseConfigured()) return;

  const db = await getDb();

  if (!db) return;
  if (!(await claimRedemption(db, reference, false))) return;

  await db
    .collection(COLLECTION)
    .updateOne({ code, redemptions: { $gt: 0 } }, { $inc: { redemptions: -1 } });
};
