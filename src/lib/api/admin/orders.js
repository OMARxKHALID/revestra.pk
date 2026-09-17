import "server-only";
import { ORDER_STATUS } from "@/lib/schemas/order";
import { getDb } from "@/lib/db";
import { markSold, releaseStock, reserveStock } from "@/lib/api/inventory";
import { recordRedemption, releaseRedemption } from "@/lib/api/promos";
import { courierTrackingUrl } from "@/lib/utils/courier";

const COLLECTION = "orders";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const NEEDS_ATTENTION = [
  { stockConflict: { $exists: true, $ne: [] } },
  { "payment.attempts.status": "unverified" },
];

const buildFilter = ({ q, status, attention }) => {
  const filter = {};

  if (status) filter.status = status;

  if (attention) filter.$and = [{ $or: NEEDS_ATTENTION }];

  if (q) {
    const pattern = new RegExp(escapeRegex(q), "i");
    filter.$or = [
      { reference: pattern },
      { email: pattern },
      { "shipping.name": pattern },
      { "shipping.phone": pattern },
    ];
  }

  return filter;
};

export const listOrders = async ({
  attention = "",
  q = "",
  status = "",
  page = 1,
  perPage = 10,
} = {}) => {
  const db = await getDb();

  if (!db) return { orders: [], total: 0, page, perPage };

  const filter = buildFilter({ q, status, attention });
  const collection = db.collection(COLLECTION);

  const [orders, total] = await Promise.all([
    collection
      .find(filter, { projection: { _id: 0, "payment.attempts": 0 } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .toArray(),
    collection.countDocuments(filter),
  ]);

  return { orders, total, page, perPage };
};

export const getOrder = async (reference) => {
  const db = await getDb();

  if (!db) return null;

  return db
    .collection(COLLECTION)
    .findOne({ reference }, { projection: { _id: 0 } });
};

export const setOrderStatus = async ({
  reference,
  status,
  note,
  courier,
  trackingNumber,
  adminId,
  couriers = [],
}) => {
  const db = await getDb();

  if (!db) return { ok: false, error: "No database is configured" };

  const order = await db.collection(COLLECTION).findOne({ reference });

  if (!order) return { ok: false, error: "No such order" };

  const now = new Date();
  const trackingCourier = courier || order.tracking?.courier || "";
  const trackingNo = trackingNumber || order.tracking?.number || "";
  const tracking =
    courier || trackingNumber
      ? {
          courier: trackingCourier,
          number: trackingNo,
          url: courierTrackingUrl(couriers, trackingCourier, trackingNo),
          at: now,
        }
      : null;
  const changed = order.status !== status;

  if (!changed && !tracking)
    return { ok: false, error: `That order is already ${status}` };

  const reopening = changed && order.status === ORDER_STATUS.cancelled;

  if (reopening) {
    const held = await reserveStock(order.items, { reference });

    if (!held.ok)
      return { ok: false, error: `Cannot reopen ${reference}: ${held.error}` };
  }

  const result = await db.collection(COLLECTION).findOneAndUpdate(
    { reference, status: order.status },
    {
      $set: { status, updatedAt: now, ...(tracking ? { tracking } : {}) },
      $push: {
        history: {
          status,
          at: now,
          note: note || (changed ? "" : "Tracking updated"),
          by: adminId ?? null,
        },
      },
    },
    { returnDocument: "after", projection: { _id: 0 } }
  );

  if (!result && reopening) await releaseStock(order.items, reference);

  if (!result)
    return {
      ok: false,
      error: "That order changed while you were editing — reload and try again",
    };

  if (!changed) return { ok: true, changed, order: result };

  if (status === ORDER_STATUS.cancelled) {
    await releaseStock(order.items, reference);

    if (order.promo) await releaseRedemption(order.promo.code, reference);
  }

  if (reopening) {
    await markSold(order.items, reference);

    if (order.promo) await recordRedemption(order.promo.code, reference);
  }

  return { ok: true, changed, order: result };
};

export const countByStatus = async () => {
  const db = await getDb();

  if (!db) return {};

  const rows = await db
    .collection(COLLECTION)
    .aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
    .toArray();

  return rows.reduce((counts, row) => ({ ...counts, [row._id]: row.count }), {});
};
