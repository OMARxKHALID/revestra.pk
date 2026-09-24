import { MongoClient } from "mongodb";

const STATUSES = [
  "received",
  "processing",
  "shipped",
  "delivered",
];

const [reference, status] = process.argv.slice(2);
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "general-store";

if (!uri) {
  console.error("MONGODB_URI is not set. Add it to .env.local.");
  process.exit(1);
}

if (!reference || !STATUSES.includes(status)) {
  console.error(
    `Usage: bun run scripts/order-status.js <reference> <${STATUSES.join("|")}>. Cancel from /admin/orders so stock is released.`
  );
  process.exit(1);
}

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });

try {
  await client.connect();

  const now = new Date();

  const result = await client
    .db(dbName)
    .collection("orders")
    .updateOne(
      { reference },
      {
        $set: { status, updatedAt: now },
        $push: { history: { status, at: now, note: "set from the CLI" } },
      }
    );

  if (result.matchedCount === 0) {
    console.error(`No order found with reference ${reference}.`);
    process.exitCode = 1;
  } else {
    console.log(`${reference} is now ${status}.`);
  }
} catch (error) {
  console.error(`Could not update the order: ${error.message}`);
  process.exitCode = 1;
} finally {
  await client.close();
}
