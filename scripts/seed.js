import { MongoClient } from "mongodb";
import { hash } from "bcryptjs";
import { PRODUCTS } from "../src/lib/products.js";
import { MOCK_PROMOS } from "../src/lib/promos.js";
import { MOCK_REVIEWS } from "../src/lib/reviews.js";
import { intakeSchema } from "../src/lib/schemas/product.js";
import { promoSchema } from "../src/lib/schemas/promo.js";
import { reviewDocSchema } from "../src/lib/schemas/review.js";
import { DEFAULT_CATEGORIES } from "../src/lib/categories.js";
import { DEFAULT_SETTINGS } from "../src/lib/settings.js";
import { categorySchema } from "../src/lib/schemas/category.js";
import { settingsSchema } from "../src/lib/schemas/settings.js";
import { ensureIndexes } from "./indexes.js";

const ADMIN = {
  name: process.env.SEED_ADMIN_NAME ?? "Omar",
  email: (process.env.SEED_ADMIN_EMAIL ?? "admin@gmail.com").toLowerCase(),
  password: process.env.SEED_ADMIN_PASSWORD ?? "adminadmin",
};

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "general-store";

if (!uri) {
  console.error(
    "MONGODB_URI is not set. Add it to .env.local, then run: bun run seed"
  );
  process.exit(1);
}

const products = PRODUCTS.map((product) => intakeSchema.parse(product));
const promos = MOCK_PROMOS.map((promo) => promoSchema.parse(promo));
const categories = DEFAULT_CATEGORIES.map((entry) => categorySchema.parse(entry));
const settings = settingsSchema.parse(DEFAULT_SETTINGS);

const reviews = MOCK_REVIEWS.map((review) =>
  reviewDocSchema.parse({
    ...review,
    email: `${review.author.toLowerCase().replace(/[^a-z]/g, "")}@example.com`,
    userId: null,
    status: "published",
    createdAt: new Date(review.createdAt),
  })
);

console.log(
  `Validated ${products.length} products, ${categories.length} categories, ${promos.length} promo codes and ${reviews.length} reviews.`
);

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });

const upsert = async (collection, documents, key, extra = () => ({})) => {
  const result = await collection.bulkWrite(
    documents.map((document, index) => ({
      updateOne: {
        filter: { [key]: document[key] },
        update: { $set: { ...document, ...extra(document, index) } },
        upsert: true,
      },
    }))
  );

  return {
    inserted: result.upsertedCount,
    updated: result.modifiedCount,
  };
};

const report = (name, { inserted, updated }) =>
  console.log(
    `Seeded "${dbName}.${name}" — ${inserted} inserted, ${updated} updated.`
  );

try {
  await client.connect();
  const db = client.db(dbName);

  await ensureIndexes(db);

  const users = db.collection("users");
  const now = new Date();

  await users.updateOne(
    { email: ADMIN.email },
    {
      $set: { name: ADMIN.name, role: "admin", updatedAt: now },
      $setOnInsert: {
        email: ADMIN.email,
        passwordHash: await hash(ADMIN.password, 12),
        wishlist: [],
        createdAt: now,
      },
    },
    { upsert: true }
  );

  const admin = await users.findOne({ email: ADMIN.email });
  const uploadedBy = String(admin._id);

  console.log(`Admin ready — ${ADMIN.name} <${ADMIN.email}> (role: admin)`);

  report("categories", await upsert(db.collection("categories"), categories, "slug"));

  await db
    .collection("settings")
    .updateOne(
      { _id: "site" },
      { $set: { ...settings, updatedAt: now, updatedBy: uploadedBy } },
      { upsert: true }
    );

  console.log(`Seeded "${dbName}.settings" — site details written.`);

  report(
    "products",
    await upsert(db.collection("products"), products, "slug", (_, index) => ({
      order: index,
      uploadedBy,
      uploadedByName: ADMIN.name,
      uploadedAt: now,
    }))
  );

  report("promo_codes", await upsert(db.collection("promo_codes"), promos, "code"));

  const reviewsCollection = db.collection("reviews");

  for (const review of reviews)
    await reviewsCollection.updateOne(
      { author: review.author, title: review.title },
      { $set: review },
      { upsert: true }
    );

  console.log(
    `Seeded "${dbName}.reviews" — ${reviews.length} sample reviews upserted.`
  );
} catch (error) {
  console.error(`Seed failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await client.close();
}
