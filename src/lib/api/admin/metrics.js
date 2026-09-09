import "server-only";
import { getDb } from "@/lib/db";
import { fillDailySeries, sinceDays } from "@/lib/utils/series";

export const SETTLED = ["received", "processing", "shipped", "delivered"];

const EMPTY = {
  revenueCents: 0,
  orders: 0,
  averageOrderCents: 0,
  windowRevenueCents: 0,
  windowOrders: 0,
  series: [],
  inventory: { available: 0, reserved: 0, sold: 0 },
  inventoryCostCents: 0,
  inventoryRetailCents: 0,
  awaitingPayment: 0,
  hiddenReviews: 0,
  subscribers: 0,
  recent: [],
  configured: false,
};

export const getMetrics = async ({ days = 30, now = new Date() } = {}) => {
  const db = await getDb();

  if (!db) return EMPTY;

  const orders = db.collection("orders");
  const from = sinceDays(days, now);

  const [lifetime, windowed, daily, inventory, awaitingPayment, hidden, subscribers, recent] =
    await Promise.all([
      orders
        .aggregate([
          { $match: { status: { $in: SETTLED } } },
          {
            $group: {
              _id: null,
              revenueCents: { $sum: "$totals.totalCents" },
              orders: { $sum: 1 },
            },
          },
        ])
        .toArray(),
      orders
        .aggregate([
          { $match: { status: { $in: SETTLED }, createdAt: { $gte: from } } },
          {
            $group: {
              _id: null,
              revenueCents: { $sum: "$totals.totalCents" },
              orders: { $sum: 1 },
            },
          },
        ])
        .toArray(),
      orders
        .aggregate([
          { $match: { status: { $in: SETTLED }, createdAt: { $gte: from } } },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              revenueCents: { $sum: "$totals.totalCents" },
              orders: { $sum: 1 },
            },
          },
          { $project: { _id: 0, day: "$_id", revenueCents: 1, orders: 1 } },
        ])
        .toArray(),
      db
        .collection("products")
        .aggregate([
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
              costCents: { $sum: "$costCents" },
              retailCents: {
                $sum: { $ifNull: ["$salePriceCents", "$priceCents"] },
              },
            },
          },
        ])
        .toArray(),
      orders.countDocuments({ status: "pending_payment" }),
      db.collection("reviews").countDocuments({ status: "hidden" }),
      db.collection("subscribers").countDocuments(),
      orders
        .find(
          { },
          {
            projection: {
              _id: 0,
              reference: 1,
              status: 1,
              createdAt: 1,
              "totals.totalCents": 1,
              "shipping.name": 1,
            },
          }
        )
        .sort({ createdAt: -1 })
        .limit(6)
        .toArray(),
    ]);

  const totals = lifetime[0] ?? { revenueCents: 0, orders: 0 };
  const inWindow = windowed[0] ?? { revenueCents: 0, orders: 0 };

  const counts = inventory.reduce(
    (all, row) => ({ ...all, [row._id]: row.count }),
    { available: 0, reserved: 0, sold: 0 }
  );

  const unsold = inventory.filter((row) => row._id !== "sold");

  return {
    revenueCents: totals.revenueCents,
    orders: totals.orders,
    averageOrderCents:
      totals.orders === 0 ? 0 : Math.round(totals.revenueCents / totals.orders),
    windowRevenueCents: inWindow.revenueCents,
    windowOrders: inWindow.orders,
    series: fillDailySeries(daily, days, now),
    inventory: counts,
    inventoryCostCents: unsold.reduce(
      (sum, row) => sum + (row.costCents ?? 0),
      0
    ),
    inventoryRetailCents: unsold.reduce(
      (sum, row) => sum + (row.retailCents ?? 0),
      0
    ),
    awaitingPayment,
    hiddenReviews: hidden,
    subscribers,
    recent,
    configured: true,
  };
};
