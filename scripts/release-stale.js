import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "general-store";
const minutes = Number(process.argv[2] ?? 60);

if (!uri) {
  console.error("MONGODB_URI is not set. Add it to .env.local.");
  process.exit(1);
}

if (!Number.isFinite(minutes) || minutes < 5) {
  console.error("Usage: bun run release-stale [minutes >= 5]");
  process.exit(1);
}

const cutoff = new Date(Date.now() - minutes * 60 * 1000);
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });

try {
  await client.connect();

  const db = client.db(dbName);
  const orders = db.collection("orders");
  const products = db.collection("products");

  const stale = await orders
    .find({
      status: "pending_payment",
      stockReserved: true,
      createdAt: { $lt: cutoff },
    })
    .toArray();

  if (stale.length === 0) {
    console.log(`No abandoned orders older than ${minutes} minutes.`);
  }

  for (const order of stale) {
    for (const line of order.items)
      await products.updateOne(
        { slug: line.slug, status: { $ne: "sold" } },
        { $set: { status: "available", reservedUntil: null } }
      );

    const now = new Date();

    await orders.updateOne(
      { reference: order.reference, status: "pending_payment" },
      {
        $set: {
          status: "cancelled",
          stockReserved: false,
          "payment.status": "failed",
          updatedAt: now,
        },
        $push: {
          history: {
            status: "cancelled",
            at: now,
            note: `abandoned for over ${minutes} minutes, stock released`,
          },
        },
      }
    );

    console.log(`Released ${order.items.length} line(s) from ${order.reference}.`);
  }
} catch (error) {
  console.error(`Could not release stale orders: ${error.message}`);
  process.exitCode = 1;
} finally {
  await client.close();
}
