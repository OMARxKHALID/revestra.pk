import "server-only";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { productsSchema, toPublicProduct } from "@/lib/schemas/product";
import { PRODUCTS as STATIC_PRODUCTS } from "@/lib/products";

const COLLECTION = "products";
const TTL_MS = 60_000;
const RETRY_MS = 5_000;

const cache = (globalThis.__catalogue ??= { promise: null, expiresAt: 0 });

const fromStatic = () =>
  productsSchema.parse(STATIC_PRODUCTS.map(toPublicProduct));

const fromDatabase = async () => {
  const db = await getDb();
  if (!db) return null;

  const documents = await db
    .collection(COLLECTION)
    .find({}, { projection: { _id: 0, costCents: 0, lot: 0 } })
    .sort({ order: 1 })
    .toArray();

  if (documents.length === 0) return null;

  return productsSchema.parse(
    documents.map(({ order, ...product }) => product)
  );
};

const loadCatalogue = async () => {
  if (!isDatabaseConfigured()) return fromStatic();

  try {
    const documents = await fromDatabase();

    if (documents) return documents;
  } catch (error) {
    console.warn(
      `[products] database read failed, using the bundled catalogue: ${error.message}`
    );
  }

  cache.expiresAt = Date.now() + RETRY_MS;

  return fromStatic();
};

export const invalidateCatalogue = () => {
  cache.expiresAt = 0;
};

export const getAllProducts = () => {
  if (cache.promise && cache.expiresAt > Date.now()) return cache.promise;

  cache.expiresAt = Date.now() + TTL_MS;
  cache.promise = loadCatalogue().catch((error) => {
    cache.promise = null;
    cache.expiresAt = 0;
    throw error;
  });

  return cache.promise;
};

export const getProductBySlug = async (slug) => {
  const products = await getAllProducts();
  return products.find((product) => product.slug === slug) ?? null;
};

export const getRelatedProducts = async (product, limit = 3) => {
  const products = await getAllProducts();
  return products
    .filter(
      (item) => item.slug !== product.slug && item.category === product.category
    )
    .slice(0, limit);
};
