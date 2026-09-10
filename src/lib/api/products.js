import "server-only";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { productsSchema, toPublicProduct } from "@/lib/schemas/product";
import { PRODUCTS as STATIC_PRODUCTS } from "@/lib/products";

import {
  dropCache,
  invalidateCatalogue,
  primeCache,
  readCache,
} from "@/lib/api/catalogue-cache";

const COLLECTION = "products";

const fromStatic = () =>
  productsSchema.parse(STATIC_PRODUCTS.map(toPublicProduct));

const fromDatabase = async () => {
  const db = await getDb();

  if (!db) throw new Error("the catalogue database is unreachable");

  const documents = await db
    .collection(COLLECTION)
    .find({}, { projection: { _id: 0, costCents: 0, lot: 0 } })
    .sort({ order: 1 })
    .toArray();

  if (documents.length === 0) return [];

  return productsSchema.parse(documents.map(({ order, ...product }) => product));
};

const loadCatalogue = async () => {
  if (!isDatabaseConfigured()) return fromStatic();

  return fromDatabase();
};

export { invalidateCatalogue };

export const getAllProducts = () => {
  const cached = readCache();

  if (cached) return cached;

  return primeCache(
    loadCatalogue().catch((error) => {
      dropCache();
      throw error;
    })
  );
};

export const getStockBySlugs = async (slugs) => {
  if (!isDatabaseConfigured() || slugs.length === 0) return new Map();

  const db = await getDb();

  if (!db) return new Map();

  const rows = await db
    .collection(COLLECTION)
    .find(
      { slug: { $in: slugs } },
      { projection: { _id: 0, slug: 1, status: 1, reservedUntil: 1 } }
    )
    .toArray();

  return new Map(rows.map((row) => [row.slug, row]));
};

const withLiveStock = async (products) => {
  const stock = await getStockBySlugs(products.map(({ slug }) => slug));

  if (stock.size === 0) return products;

  return products.map((product) => {
    const live = stock.get(product.slug);

    return live ? { ...product, ...live } : product;
  });
};

export const getSellableProducts = async () =>
  withLiveStock(await getAllProducts());

export const getProductBySlug = async (slug) => {
  const products = await getAllProducts();
  const product = products.find((item) => item.slug === slug) ?? null;

  if (!product) return null;

  const [live] = await withLiveStock([product]);

  return live;
};

export const getRelatedProducts = async (product, limit = 3) => {
  const products = await getSellableProducts();

  return products
    .filter(
      (item) => item.slug !== product.slug && item.category === product.category
    )
    .slice(0, limit);
};
