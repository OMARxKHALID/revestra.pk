import "server-only";
import { getDb } from "@/lib/db";
import { releaseStock, markSold } from "@/lib/api/inventory";

const COLLECTION = "orders";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildFilter = ({ q, status }) => {
  const filter = {};

  if (status) filter.status = status;

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
  q = "",
  status = "",
  page = 1,
  perPage = 25,
} = {}) => {
  const db = await getDb();

  if (!db) return { orders: [], total: 0, page, perPage };

  const filter = buildFilter({ q, status });
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

export const setOrderStatus = async ({ reference, status, note, adminId }) => {
  const db = await getDb();

  if (!db) return { ok: false, error: "No database is configured" };

  const order = await db.collection(COLLECTION).findOne({ reference });

  if (!order) return { ok: false, error: "No such order" };
  if (order.status === status)
    return { ok: false, error: `That order is already ${status}` };

  const now = new Date();

  const result = await db.collection(COLLECTION).findOneAndUpdate(
    { reference },
    {
      $set: { status, updatedAt: now },
      $push: {
        history: { status, at: now, note: note || "", by: adminId ?? null },
      },
    },
    { returnDocument: "after", projection: { _id: 0 } }
  );

  if (status === "cancelled") await releaseStock(order.items);
  if (status === "received" && order.status === "cancelled")
    await markSold(order.items);

  return { ok: true, order: result?.value ?? result ?? null };
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
