import "server-only";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { authSecret } from "@/lib/secrets";

const COLLECTION = "orders";

export const orderSecret = () =>
  authSecret() ?? "development-order-token-secret";

export const buildReference = (now = Date.now(), random = Math.random) =>
  `CP-${now.toString(36).toUpperCase()}-${random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;

export const insertOrder = async (order) => {
  if (!isDatabaseConfigured()) {
    console.info(
      `[orders] no database configured, order ${order.reference} not stored`
    );
    return { persisted: false };
  }

  const db = await getDb();

  if (!db) return { persisted: false };

  await db.collection(COLLECTION).insertOne({ ...order });

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

  await db
    .collection(COLLECTION)
    .updateOne(
      { reference },
      { $push: { "payment.attempts": attempt }, $set: { updatedAt: new Date() } }
    );
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
    { "payment.attempts.ref": attemptRef, "payment.status": "pending" },
    {
      $set: {
        "payment.status": status,
        "payment.settledAt": status === "paid" ? now : null,
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

  return result?.value ?? result ?? null;
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

  return result?.value ?? result ?? null;
};
