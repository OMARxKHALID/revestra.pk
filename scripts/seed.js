import { MongoClient } from "mongodb";
import { PRODUCTS } from "../src/lib/products.js";
import { MOCK_PROMOS } from "../src/lib/promos.js";
import { MOCK_REVIEWS } from "../src/lib/reviews.js";
import { intakeSchema } from "../src/lib/schemas/product.js";
import { promoSchema } from "../src/lib/schemas/promo.js";
import { reviewDocSchema } from "../src/lib/schemas/review.js";
import { ensureIndexes } from "./indexes.js";

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
  `Validated ${products.length} products, ${promos.length} promo codes and ${reviews.length} reviews.`
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

  report(
    "products",
    await upsert(db.collection("products"), products, "slug", (_, index) => ({
      order: index,
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
