import "server-only";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { settingsSchema } from "@/lib/schemas/settings";
import { DEFAULT_SETTINGS } from "@/lib/settings";

const COLLECTION = "settings";
const DOCUMENT_ID = "site";
const TTL_MS = 30_000;

const cache = (globalThis.__settings ??= { value: null, expiresAt: 0 });

const invalidateSettings = () => {
  cache.expiresAt = 0;
};

export const getSettings = async () => {
  if (cache.value && cache.expiresAt > Date.now()) return cache.value;

  if (!isDatabaseConfigured()) return DEFAULT_SETTINGS;

  let stored = null;

  try {
    const db = await getDb();

    if (db)
      stored = await db
        .collection(COLLECTION)
        .findOne({ _id: DOCUMENT_ID }, { projection: { _id: 0 } });
  } catch {
    return cache.value ?? DEFAULT_SETTINGS;
  }

  const parsed = settingsSchema.safeParse({ ...DEFAULT_SETTINGS, ...stored });
  const value = parsed.success ? parsed.data : DEFAULT_SETTINGS;

  cache.value = value;
  cache.expiresAt = Date.now() + TTL_MS;

  return value;
};

export const saveSettings = async (settings, adminId = null) => {
  const db = await getDb();

  if (!db) return { ok: false, error: "No database is configured" };

  await db.collection(COLLECTION).updateOne(
    { _id: DOCUMENT_ID },
    { $set: { ...settings, updatedAt: new Date(), updatedBy: adminId } },
    { upsert: true }
  );

  invalidateSettings();

  return { ok: true, settings };
};
