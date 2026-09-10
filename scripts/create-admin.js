import { MongoClient } from "mongodb";
import { hash } from "bcryptjs";
import { ensureIndexes } from "./indexes.js";

const COST = 12;

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "general-store";
const [rawEmail, password, ...nameParts] = process.argv.slice(2);

if (!uri) {
  console.error("MONGODB_URI is not set. Add it to .env.local.");
  process.exit(1);
}

if (!rawEmail || !password) {
  console.error(
    "Usage: bun run create-admin <email> <password> [name]"
  );
  process.exit(1);
}

if (password.length < 8) {
  console.error("Passwords must be at least 8 characters.");
  process.exit(1);
}

const email = rawEmail.trim().toLowerCase();
const name = nameParts.join(" ") || email.split("@")[0];

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });

try {
  await client.connect();

  const db = client.db(dbName);

  await ensureIndexes(db);

  const now = new Date();
  const passwordHash = await hash(password, COST);

  const result = await db.collection("users").updateOne(
    { email },
    {
      $set: { passwordHash, role: "admin", name, updatedAt: now },
      $setOnInsert: {
        email,
        wishlist: [],
        emailVerified: null,
        createdAt: now,
      },
    },
    { upsert: true }
  );

  console.log(
    result.upsertedCount
      ? `Created admin ${email}.`
      : `Updated ${email} — now an admin with a new password.`
  );
  console.log("Sign in at /sign-in, then open /admin.");
} catch (error) {
  console.error(`Could not create the admin: ${error.message}`);
  process.exitCode = 1;
} finally {
  await client.close();
}
