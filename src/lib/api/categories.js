import "server-only";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { categorySchema } from "@/lib/schemas/category";
import { DEFAULT_CATEGORIES } from "@/lib/categories";

const COLLECTION = "categories";
const TTL_MS = 30_000;

const cache = (globalThis.__categories ??= { value: null, expiresAt: 0 });

export const invalidateCategories = () => {
  cache.expiresAt = 0;
};

export const listCategories = async ({ includeInactive = false } = {}) => {
  if (!cache.value || cache.expiresAt <= Date.now()) {
    if (!isDatabaseConfigured()) {
      cache.value = DEFAULT_CATEGORIES;
    } else {
      const db = await getDb();
      const rows = db
        ? await db
            .collection(COLLECTION)
            .find({}, { projection: { _id: 0 } })
            .sort({ order: 1, name: 1 })
            .toArray()
        : [];

      cache.value =
        rows.length > 0
          ? rows.map((row) => categorySchema.parse(row))
          : DEFAULT_CATEGORIES;
    }

    cache.expiresAt = Date.now() + TTL_MS;
  }

  return includeInactive
    ? cache.value
    : cache.value.filter((category) => category.active);
};

export const categoryNames = async () =>
  (await listCategories()).map((category) => category.name);

export const createCategory = async (category) => {
  const db = await getDb();

  if (!db) return { ok: false, error: "No database is configured" };

  const clash = await db
    .collection(COLLECTION)
    .findOne({ $or: [{ slug: category.slug }, { name: category.name }] });

  if (clash) return { ok: false, error: "That slug or name already exists" };

  await db
    .collection(COLLECTION)
    .insertOne({ ...category, createdAt: new Date() });

  invalidateCategories();

  return { ok: true, category };
};

export const updateCategory = async (slug, patch) => {
  const db = await getDb();

  if (!db) return { ok: false, error: "No database is configured" };

  const updated = await db
    .collection(COLLECTION)
    .findOneAndUpdate(
      { slug },
      { $set: { ...patch, updatedAt: new Date() } },
      { returnDocument: "after", projection: { _id: 0 } }
    );

  if (!updated) return { ok: false, error: "No such category" };

  invalidateCategories();

  return { ok: true, category: updated };
};

export const deleteCategory = async (slug) => {
  const db = await getDb();

  if (!db) return { ok: false, error: "No database is configured" };

  const category = await db.collection(COLLECTION).findOne({ slug });

  if (!category) return { ok: false, error: "No such category" };

  const inUse = await db
    .collection("products")
    .countDocuments({ category: category.name }, { limit: 1 });

  if (inUse > 0)
    return {
      ok: false,
      error: `${category.name} still has pieces in the catalogue — move them first, or hide the category instead`,
    };

  await db.collection(COLLECTION).deleteOne({ slug });

  invalidateCategories();

  return { ok: true };
};
