import "server-only";
import { getDb } from "@/lib/db";
import { invalidateCatalogue } from "@/lib/api/catalogue-cache";
import slugify from "@/lib/utils/slugify";

const COLLECTION = "products";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildFilter = ({ q, status, category }) => {
  const filter = {};

  if (status) filter.status = status;
  if (category) filter.category = category;

  if (q) {
    const pattern = new RegExp(escapeRegex(q), "i");
    filter.$or = [
      { name: pattern },
      { brand: pattern },
      { sku: pattern },
      { slug: pattern },
      { sizeLabel: pattern },
      { lot: pattern },
    ];
  }

  return filter;
};

export const listProducts = async ({
  q = "",
  status = "",
  category = "",
  page = 1,
  perPage = 10,
} = {}) => {
  const db = await getDb();

  if (!db) return { products: [], total: 0, page, perPage };

  const filter = buildFilter({ q, status, category });
  const collection = db.collection(COLLECTION);

  const [products, total] = await Promise.all([
    collection
      .find(filter, { projection: { _id: 0 } })
      .sort({ order: 1, sku: 1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .toArray(),
    collection.countDocuments(filter),
  ]);

  return { products, total, page, perPage };
};

export const getProduct = async (slug) => {
  const db = await getDb();

  if (!db) return null;

  return db.collection(COLLECTION).findOne({ slug }, { projection: { _id: 0 } });
};

export const nextSku = async (prefix = "RV") => {
  const db = await getDb();

  if (!db) return `${prefix}-0001`;

  const [latest] = await db
    .collection(COLLECTION)
    .find({ sku: new RegExp(`^${prefix}-`) }, { projection: { sku: 1 } })
    .sort({ sku: -1 })
    .limit(1)
    .toArray();

  const current = Number(latest?.sku?.split("-")[1] ?? 0);

  return `${prefix}-${String(current + 1).padStart(4, "0")}`;
};

export const derive = async (input) => ({
  ...input,
  slug: input.slug || slugify(input.brand, input.name, input.sizeLabel),
  sku: input.sku || (await nextSku()),
});

export const createProduct = async (product) => {
  const db = await getDb();

  if (!db) return { ok: false, error: "No database is configured" };

  const collection = db.collection(COLLECTION);
  const clash = await collection.findOne({
    $or: [{ slug: product.slug }, { sku: product.sku }],
  });

  if (clash)
    return { ok: false, error: "That slug or SKU is already in the catalogue" };

  const now = new Date();
  const last = await collection
    .find({}, { projection: { order: 1 } })
    .sort({ order: -1 })
    .limit(1)
    .toArray();

  await collection.insertOne({
    ...product,
    order: (last[0]?.order ?? -1) + 1,
    createdAt: now,
    updatedAt: now,
  });

  invalidateCatalogue();

  return { ok: true, product };
};

export const updateProduct = async (slug, patch) => {
  const db = await getDb();

  if (!db) return { ok: false, error: "No database is configured" };

  const result = await db
    .collection(COLLECTION)
    .findOneAndUpdate(
      { slug },
      { $set: { ...patch, updatedAt: new Date() } },
      { returnDocument: "after", projection: { _id: 0 } }
    );

  const product = result ?? null;

  if (!product) return { ok: false, error: "No such piece" };

  invalidateCatalogue();

  return { ok: true, product };
};

export const deleteProduct = async (slug) => {
  const db = await getDb();

  if (!db) return { ok: false, error: "No database is configured" };

  const sold = await db
    .collection("orders")
    .findOne({ "items.slug": slug }, { projection: { reference: 1 } });

  if (sold)
    return {
      ok: false,
      error: `That piece is on order ${sold.reference} — mark it sold instead`,
    };

  const { deletedCount } = await db.collection(COLLECTION).deleteOne({ slug });

  if (deletedCount === 0) return { ok: false, error: "No such piece" };

  invalidateCatalogue();

  return { ok: true };
};

export const countByStatus = async () => {
  const db = await getDb();

  if (!db) return { available: 0, reserved: 0, sold: 0 };

  const rows = await db
    .collection(COLLECTION)
    .aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
    .toArray();

  return rows.reduce(
    (counts, row) => ({ ...counts, [row._id]: row.count }),
    { available: 0, reserved: 0, sold: 0 }
  );
};

export const setStatus = async (slug, status) =>
  updateProduct(slug, {
    status,
    soldAt: status === "sold" ? new Date() : null,
    reservedUntil: null,
  });

export const countProductsByCategory = async () => {
  const db = await getDb();

  if (!db) return {};

  const rows = await db
    .collection(COLLECTION)
    .aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }])
    .toArray();

  return rows.reduce(
    (counts, row) => ({ ...counts, [row._id]: row.count }),
    {}
  );
};

export const listImageLibrary = async (limit = 120) => {
  const db = await getDb();

  if (!db) return [];

  const rows = await db
    .collection(COLLECTION)
    .find({}, { projection: { _id: 0, image: 1, images: 1 } })
    .limit(limit)
    .toArray();

  const seen = new Set();

  for (const row of rows)
    for (const url of [row.image, ...(row.images ?? [])])
      if (url) seen.add(url);

  return [...seen];
};
