import "server-only";
import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { getDb } from "@/lib/db";

const COLLECTION = "password_resets";

export const CODE_TTL_MINUTES = 15;
const MAX_ATTEMPTS = 5;

const digest = (code) => createHash("sha256").update(code, "utf8").digest("hex");

const generateCode = () => String(randomInt(0, 1_000_000)).padStart(6, "0");

export const requestReset = async (email) => {
  const db = await getDb();

  if (!db) return null;

  const code = generateCode();
  const now = new Date();
  const key = email.trim().toLowerCase();
  const collection = db.collection(COLLECTION);
  const current = await collection.findOne({ _id: key });
  const live = current && new Date(current.expiresAt).getTime() > now.getTime();

  await collection.updateOne(
    { _id: key },
    {
      $set: {
        codeHash: digest(code),
        expiresAt: new Date(now.getTime() + CODE_TTL_MINUTES * 60 * 1000),
        attempts: live ? (current.attempts ?? 0) : 0,
        createdAt: now,
      },
    },
    { upsert: true }
  );

  return code;
};

export const verifyCode = async (email, code) => {
  const db = await getDb();

  if (!db) return { ok: false, error: "No database is configured" };

  const key = email.trim().toLowerCase();
  const collection = db.collection(COLLECTION);
  const entry = await collection.findOneAndUpdate(
    {
      _id: key,
      expiresAt: { $gt: new Date() },
      attempts: { $lt: MAX_ATTEMPTS },
    },
    { $inc: { attempts: 1 } },
    { returnDocument: "before" }
  );

  if (!entry) {
    const stale = await collection.findOne({ _id: key });

    if (!stale) return { ok: false, error: "That code is not valid" };

    if (new Date(stale.expiresAt).getTime() <= Date.now())
      return { ok: false, error: "That code has expired. Ask for a new one." };

    return { ok: false, error: "Too many wrong codes. Ask for a new one." };
  }

  const expected = Buffer.from(entry.codeHash, "utf8");
  const supplied = Buffer.from(digest(String(code)), "utf8");
  const matches =
    expected.length === supplied.length && timingSafeEqual(expected, supplied);

  if (!matches) return { ok: false, error: "That code is not valid" };

  await collection.deleteOne({ _id: key });

  return { ok: true };
};
