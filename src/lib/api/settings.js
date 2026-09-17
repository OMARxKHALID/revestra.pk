import "server-only";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { settingsSchema } from "@/lib/schemas/settings";
import { DEFAULT_SETTINGS } from "@/lib/settings";

const COLLECTION = "settings";
const DOCUMENT_ID = "site";

export const getSettings = async () => {
  if (!isDatabaseConfigured()) return DEFAULT_SETTINGS;

  let stored = null;

  try {
    const db = await getDb();

    if (db)
      stored = await db
        .collection(COLLECTION)
        .findOne({ _id: DOCUMENT_ID }, { projection: { _id: 0 } });
  } catch {
    return DEFAULT_SETTINGS;
  }

  const parsed = settingsSchema.safeParse({ ...DEFAULT_SETTINGS, ...stored });

  return parsed.success ? parsed.data : DEFAULT_SETTINGS;
};

export const saveSettings = async (settings, adminId = null) => {
  const db = await getDb();

  if (!db) return { ok: false, error: "No database is configured" };

  await db.collection(COLLECTION).updateOne(
    { _id: DOCUMENT_ID },
    { $set: { ...settings, updatedAt: new Date(), updatedBy: adminId } },
    { upsert: true }
  );

  return { ok: true, settings };
};
