import "server-only";
import { getDb } from "@/lib/db";
import { ROLE } from "@/lib/roles";
import { FULFILLED_ORDER_STATUSES } from "@/lib/schemas/order";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const objectId = async (value) => {
  const { ObjectId } = await import("mongodb");

  return ObjectId.isValid(value) ? new ObjectId(value) : null;
};

export const listCustomers = async ({ q = "", page = 1, perPage = 10 } = {}) => {
  const db = await getDb();

  if (!db) return { customers: [], total: 0, page, perPage };

  const pattern = q ? new RegExp(escapeRegex(q), "i") : null;
  const filter = pattern ? { $or: [{ email: pattern }, { name: pattern }] } : {};
  const users = db.collection("users");

  const [rows, total] = await Promise.all([
    users
      .find(filter, { projection: { passwordHash: 0, wishlist: 0 } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .toArray(),
    users.countDocuments(filter),
  ]);

  const stats = await db
    .collection("orders")
    .aggregate([
      {
        $match: {
          email: { $in: rows.map(({ email }) => email) },
          status: { $in: FULFILLED_ORDER_STATUSES },
        },
      },
      {
        $group: {
          _id: "$email",
          orders: { $sum: 1 },
          spentCents: { $sum: "$totals.totalCents" },
          lastOrderAt: { $max: "$createdAt" },
        },
      },
    ])
    .toArray();

  const byEmail = new Map(stats.map((entry) => [entry._id, entry]));

  return {
    customers: rows.map((user) => ({
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role ?? ROLE.customer,
      createdAt: user.createdAt ?? null,
      orders: byEmail.get(user.email)?.orders ?? 0,
      spentCents: byEmail.get(user.email)?.spentCents ?? 0,
      lastOrderAt: byEmail.get(user.email)?.lastOrderAt ?? null,
    })),
    total,
    page,
    perPage,
  };
};

export const setCustomerRole = async ({ userId, role, actingAdminId }) => {
  if (userId === actingAdminId)
    return { ok: false, error: "You cannot change your own role" };

  const db = await getDb();
  const id = await objectId(userId);

  if (!db || !id) return { ok: false, error: "No such account" };

  const users = db.collection("users");
  const target = await users.findOne({ _id: id }, { projection: { role: 1 } });

  if (!target) return { ok: false, error: "No such account" };

  const current = target.role ?? ROLE.customer;

  if (current === role) return { ok: true, role };

  if (current === ROLE.admin && (await users.countDocuments({ role: ROLE.admin })) <= 1)
    return { ok: false, error: "Keep at least one admin" };

  await users.updateOne({ _id: id }, { $set: { role, updatedAt: new Date() } });

  return { ok: true, role };
};
