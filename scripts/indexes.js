export const ensureIndexes = async (db) => {
  await db.collection("products").createIndex({ slug: 1 }, { unique: true });
  await db.collection("products").createIndex({ sku: 1 }, { unique: true });
  await db.collection("products").createIndex({ category: 1 });
  await db.collection("products").createIndex({ status: 1, reservedUntil: 1 });
  await db.collection("products").createIndex({ brand: 1 });
  await db.collection("products").createIndex({ lot: 1 });

  await db.collection("subscribers").createIndex({ email: 1 }, { unique: true });

  await db.collection("users").createIndex({ email: 1 }, { unique: true });

  await db.collection("orders").createIndex({ reference: 1 }, { unique: true });
  await db.collection("orders").createIndex({ email: 1, createdAt: -1 });
  await db.collection("orders").createIndex({ userId: 1, createdAt: -1 });
  await db.collection("orders").createIndex({ "payment.attempts.ref": 1 });
  await db.collection("orders").createIndex({ status: 1, createdAt: -1 });
  await db.collection("orders").createIndex({ createdAt: -1 });

  await db.collection("reviews").createIndex({ id: 1 }, { unique: true });
  await db.collection("review_images").createIndex({ createdAt: -1 });
  await db.collection("reviews").createIndex({ createdAt: -1 });
  await db.collection("reviews").createIndex({ status: 1, createdAt: -1 });
  await db
    .collection("reviews")
    .createIndex(
      { userId: 1 },
      {
        unique: true,
        partialFilterExpression: { userId: { $type: "string" } },
      }
    );

  await db.collection("categories").createIndex({ slug: 1 }, { unique: true });
  await db.collection("categories").createIndex({ name: 1 }, { unique: true });
  await db.collection("categories").createIndex({ order: 1 });

  await db.collection("promo_codes").createIndex({ code: 1 }, { unique: true });

  await db
    .collection("rate_limits")
    .createIndex({ resetAt: 1 }, { expireAfterSeconds: 0 });

  await db
    .collection("password_resets")
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
};
