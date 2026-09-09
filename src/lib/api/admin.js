import "server-only";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { invalidateCatalogue } from "@/lib/api/products";
import { intakeSchema } from "@/lib/schemas/product";
import slugify from "@/lib/utils/slugify";

const COLLECTION = "products";

const collection = async () => {
  const db = await getDb();
  return db ? db.collection(COLLECTION) : null;
};

export const adminIsAvailable = () => isDatabaseConfigured();

export const listInventory = async () => {
  const products = await collection();

  if (!products) return [];

  return products
    .find({}, { projection: { _id: 0 } })
    .sort({ createdAt: -1, order: 1 })
    .toArray();
};

export const inventoryStats = (products) => {
  const sold = products.filter((product) => product.status === "sold");

  const revenue = sold.reduce(
    (total, product) => total + (product.salePriceCents ?? product.priceCents),
    0
  );

  const spend = products.reduce(
    (total, product) => total + (product.costCents ?? 0),
    0
  );

  const soldSpend = sold.reduce(
    (total, product) => total + (product.costCents ?? 0),
    0
  );

  return {
    total: products.length,
    available: products.filter((p) => p.status === "available").length,
    reserved: products.filter((p) => p.status === "reserved").length,
    sold: sold.length,
    spendCents: spend,
    revenueCents: revenue,
    marginCents: revenue - soldSpend,
  };
};

export const nextSku = async () => {
  const products = await collection();

  if (!products) return "GS-0001";

  const [last] = await products
    .find({}, { projection: { sku: 1 } })
    .sort({ sku: -1 })
    .limit(1)
    .toArray();

  const current = Number(last?.sku?.replace(/\D/g, "") ?? 0);

  return `GS-${String(current + 1).padStart(4, "0")}`;
};

export const createProduct = async (input) => {
  const products = await collection();

  if (!products) throw new Error("No database is configured");

  const slug =
    input.slug ?? slugify(input.brand, input.name, input.sizeLabel);

  const parsed = intakeSchema.parse({
    ...input,
    slug,
    sku: input.sku ?? (await nextSku()),
  });

  const existing = await products.findOne({ slug: parsed.slug });

  if (existing) return { ok: false, reason: "slug-taken", slug: parsed.slug };

  const now = new Date();

  await products.insertOne({ ...parsed, createdAt: now, updatedAt: now });

  invalidateCatalogue();

  return { ok: true, product: parsed };
};

export const updateProduct = async (slug, changes) => {
  const products = await collection();

  if (!products) throw new Error("No database is configured");

  const current = await products.findOne({ slug }, { projection: { _id: 0 } });

  if (!current) return { ok: false, reason: "not-found" };

  const parsed = intakeSchema.parse({ ...current, ...changes, slug });

  await products.updateOne(
    { slug },
    { $set: { ...parsed, updatedAt: new Date() } }
  );

  invalidateCatalogue();

  return { ok: true, product: parsed };
};

export const setStatus = async (slug, status) => {
  const products = await collection();

  if (!products) throw new Error("No database is configured");

  const result = await products.updateOne(
    { slug },
    {
      $set: {
        status,
        soldAt: status === "sold" ? new Date() : null,
        reservedUntil: null,
        updatedAt: new Date(),
      },
    }
  );

  invalidateCatalogue();

  return { ok: result.matchedCount > 0 };
};

export const deleteProduct = async (slug) => {
  const products = await collection();

  if (!products) throw new Error("No database is configured");

  const db = await getDb();

  const onOrder = await db
    .collection("orders")
    .findOne({ "items.slug": slug }, { projection: { reference: 1 } });

  if (onOrder)
    return {
      ok: false,
      reason: "on-order",
      reference: onOrder.reference,
    };

  const { deletedCount } = await products.deleteOne({ slug });

  if (deletedCount === 0) return { ok: false, reason: "not-found" };

  invalidateCatalogue();

  return { ok: true };
};
