import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "general-store";
const [email] = process.argv.slice(2);

if (!uri) {
  console.error("MONGODB_URI is not set. Add it to .env.local.");
  process.exit(1);
}

if (!email) {
  console.error("Usage: bun run make-admin <email>");
  process.exit(1);
}

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });

try {
  await client.connect();

  const result = await client
    .db(dbName)
    .collection("users")
    .updateOne(
      { email: email.trim().toLowerCase() },
      { $set: { role: "admin", updatedAt: new Date() } }
    );

  if (result.matchedCount === 0) {
    console.error(`No account found for ${email}. Sign up first.`);
    process.exitCode = 1;
  } else {
    console.log(`${email} is now an admin. Sign out and back in.`);
  }
} catch (error) {
  console.error(`Could not update the account: ${error.message}`);
  process.exitCode = 1;
} finally {
  await client.close();
}
