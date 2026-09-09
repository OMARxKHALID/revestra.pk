import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "general-store";

let cached = globalThis.__mongo;

if (!cached) cached = globalThis.__mongo = { client: null, promise: null };

export const isDatabaseConfigured = () => Boolean(uri);

export const getDb = async () => {
  if (!uri) return null;

  if (!cached.promise) {
    cached.promise = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
    })
      .connect()
      .then((client) => {
        cached.client = client;
        return client.db(dbName);
      })
      .catch((error) => {
        cached.promise = null;
        throw error;
      });
  }

  return cached.promise;
};
