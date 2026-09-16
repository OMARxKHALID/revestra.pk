import "server-only";
import { ORDER_STATUS, PAYMENT_STATUS } from "@/lib/schemas/order";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { authSecret } from "@/lib/secrets";

const COLLECTION = "orders";

export const orderSecret = () =>
  authSecret() ?? "development-order-token-secret";

export const buildReference = (now = Date.now(), random = Math.random) =>
  `RV-${now.toString(36).toUpperCase()}-${random()
    .toString(36)
    .slice(2, 8)
    .padEnd(6, "0")
    .toUpperCase()}`;

const DUPLICATE_KEY = 11000;

const isDuplicateKey = (error) =>
  Boolean(error) &&
  typeof error === "object" &&
  Number(Reflect.get(error, "code")) === DUPLICATE_KEY;

export const insertOrder = async (order) => {
  if (!isDatabaseConfigured()) {
    console.info(
      `[orders] no database configured, order ${order.reference} not stored`
    );
    return { persisted: false };
  }

  const db = await getDb();

  if (!db) return { persisted: false };

  try {
    await db.collection(COLLECTION).insertOne({ ...order });
  } catch (error) {
    if (isDuplicateKey(error)) return { persisted: false, duplicate: true };

    throw error;
  }

  return { persisted: true };
};

export const findOrderByReference = async (reference) => {
  const db = await getDb();

  if (!db) return null;

  return db
    .collection(COLLECTION)
    .findOne({ reference }, { projection: { _id: 0 } });
};

export const findOrderByAttemptRef = async (attemptRef) => {
  const db = await getDb();

  if (!db) return null;

  return db
    .collection(COLLECTION)
    .findOne({ "payment.attempts.ref": attemptRef }, { projection: { _id: 0 } });
};

export const recordAttempt = async (reference, attempt) => {
  const db = await getDb();

  if (!db) return;

  await db.collection(COLLECTION).updateOne(
    {
      reference,
      "payment.attempts": { $not: { $elemMatch: { ref: attempt.ref } } },
    },
    { $push: { "payment.attempts": attempt }, $set: { updatedAt: new Date() } }
  );
};

export const nextAttempt = (order) => {
  const attempts = order.payment.attempts ?? [];
  const concluded = new Set(
    attempts.filter((entry) => entry.status !== "started").map((entry) => entry.ref)
  );
  const started = attempts.filter((entry) => entry.status === "started");
  const open = [...started].reverse().find((entry) => !concluded.has(entry.ref));

  return open?.index ?? started.length + 1;
};

export const settlePayment = async ({
  attemptRef,
  status,
  orderStatus,
  attempt,
  providerTxnId,
  verification,
}) => {
  const db = await getDb();

  if (!db) return null;

  const now = new Date();

  const result = await db.collection(COLLECTION).findOneAndUpdate(
    {
      "payment.attempts.ref": attemptRef,
      "payment.status": PAYMENT_STATUS.pending,
    },
    {
      $set: {
        "payment.status": status,
        "payment.settledAt": status === PAYMENT_STATUS.paid ? now : null,
        "payment.providerTxnId": providerTxnId ?? null,
        "payment.verification": verification,
        status: orderStatus,
        updatedAt: now,
      },
      $push: {
        "payment.attempts": attempt,
        history: { status: orderStatus, at: now, note: attempt.message ?? "" },
      },
    },
    { returnDocument: "after", projection: { _id: 0 } }
  );

  return result ?? null;
};

export const flagStockConflict = async (reference, slugs) => {
  if (!slugs?.length) return { flagged: false };

  const db = await getDb();

  if (!db) return { flagged: false };

  await db.collection(COLLECTION).updateOne(
    { reference },
    {
      $set: {
        stockConflict: slugs,
        stockConflictAt: new Date(),
        updatedAt: new Date(),
      },
    }
  );

  return { flagged: true };
};

export const findStaleOrders = async (cutoff) => {
  const db = await getDb();

  if (!db) return [];

  return db
    .collection(COLLECTION)
    .find(
      {
        status: ORDER_STATUS.pendingPayment,
        stockReserved: true,
        createdAt: { $lt: cutoff },
      },
      { projection: { _id: 0 } }
    )
    .toArray();
};

export const CANCELLABLE_STATUSES = [
  ORDER_STATUS.pendingPayment,
  ORDER_STATUS.received,
  ORDER_STATUS.processing,
];

export const cancelOrderDocument = async (
  reference,
  note,
  from = [ORDER_STATUS.pendingPayment]
) => {
  const db = await getDb();

  if (!db) return { cancelled: false };

  const now = new Date();

  const result = await db.collection(COLLECTION).updateOne(
    { reference, status: { $in: from } },
    {
      $set: {
        status: ORDER_STATUS.cancelled,
        stockReserved: false,
        "payment.status": PAYMENT_STATUS.failed,
        promoRedeemed: false,
        updatedAt: now,
      },
      $push: { history: { status: ORDER_STATUS.cancelled, at: now, note } },
    }
  );

  return { cancelled: result.modifiedCount > 0 };
};

export const listOrdersForUser = async (userId, limit = 20) => {
  const db = await getDb();

  if (!db || !userId) return [];

  return db
    .collection(COLLECTION)
    .find({ userId }, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
};

export const claimOrder = async (reference, email, userId) => {
  const db = await getDb();

  if (!db) return null;

  const result = await db
    .collection(COLLECTION)
    .findOneAndUpdate(
      { reference, email: email.toLowerCase(), userId: null },
      { $set: { userId, updatedAt: new Date() } },
      { returnDocument: "after", projection: { _id: 0 } }
    );

  return result ?? null;
};
