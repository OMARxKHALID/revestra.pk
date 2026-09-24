import "server-only";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { settingsSchema } from "@/lib/schemas/settings";
import { DEFAULT_SETTINGS } from "@/lib/settings";

const COLLECTION = "settings";
const DOCUMENT_ID = "site";

const TTL_MS = 60_000;

const cache = (globalThis.__settings ??= { promise: null, expiresAt: 0 });

const loadSettings = async () => {
  let stored = null;

  try {
    const db = await getDb();

    if (db)
      stored = await db
        .collection(COLLECTION)
        .findOne({ _id: DOCUMENT_ID }, { projection: { _id: 0 } });
  } catch {
    cache.expiresAt = 0;

    return DEFAULT_SETTINGS;
  }

  const parsed = settingsSchema.safeParse({ ...DEFAULT_SETTINGS, ...stored });

  return parsed.success ? parsed.data : DEFAULT_SETTINGS;
};

export const getSettings = () => {
  if (!isDatabaseConfigured()) return Promise.resolve(DEFAULT_SETTINGS);

  if (cache.promise && cache.expiresAt > Date.now()) return cache.promise;

  cache.expiresAt = Date.now() + TTL_MS;
  cache.promise = loadSettings();

  return cache.promise;
};

export const saveSettings = async (settings, adminId = null) => {
  const db = await getDb();

  if (!db) return { ok: false, error: "No database is configured" };

  await db.collection(COLLECTION).updateOne(
    { _id: DOCUMENT_ID },
    { $set: { ...settings, updatedAt: new Date(), updatedBy: adminId } },
    { upsert: true }
  );

  cache.expiresAt = 0;

  return { ok: true, settings };
};
