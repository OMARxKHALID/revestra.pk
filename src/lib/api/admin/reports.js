import "server-only";
import { getDb } from "@/lib/db";
import { FULFILLED_ORDER_STATUSES } from "@/lib/schemas/order";
import { buildSalesReport } from "@/lib/utils/sales-report";

const MAX_ORDERS = 5000;

export const getSalesReport = async ({ days = 0, now = new Date() } = {}) => {
  const db = await getDb();

  if (!db) return { configured: false, ...buildSalesReport({}) };

  const match = { status: { $in: FULFILLED_ORDER_STATUSES } };

  if (days > 0)
    match.createdAt = { $gte: new Date(now.getTime() - days * 86_400_000) };

  const [orders, products] = await Promise.all([
    db
      .collection("orders")
      .find(match, {
        projection: { _id: 0, createdAt: 1, totals: 1, "items.slug": 1, "items.unitCents": 1 },
      })
      .sort({ createdAt: -1 })
      .limit(MAX_ORDERS)
      .toArray(),
    db
      .collection("products")
      .find({}, { projection: { _id: 0, slug: 1, brand: 1, category: 1, costCents: 1 } })
      .toArray(),
  ]);

  return {
    configured: true,
    ...buildSalesReport({
      orders,
      products: new Map(products.map((product) => [product.slug, product])),
    }),
  };
};
