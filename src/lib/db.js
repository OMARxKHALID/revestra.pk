import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "general-store";

const RETRY_AFTER_MS = 5_000;

const OPTIONS = {
  serverSelectionTimeoutMS: 5_000,
  connectTimeoutMS: 10_000,
  socketTimeoutMS: 20_000,
  maxPoolSize: 10,
  minPoolSize: 0,
  maxIdleTimeMS: 60_000,
  retryWrites: true,
  retryReads: true,
};

export class DatabaseUnavailableError extends Error {
  constructor() {
    super("The catalogue database is unreachable");
    this.name = "DatabaseUnavailableError";
    this.expected = true;
  }
}

const safeReason = (error) => {
  const message = error instanceof Error ? error.message : String(error);

  return message.replace(/mongodb(\+srv)?:\/\/[^\s]*/gi, "<uri>").slice(0, 200);
};

const state = (globalThis.__mongo ??= { promise: null, failedAt: 0 });

export const isDatabaseConfigured = () => Boolean(uri);

export const getDb = async () => {
  if (!uri) return null;

  if (!state.promise && Date.now() - state.failedAt < RETRY_AFTER_MS)
    throw new DatabaseUnavailableError();

  if (!state.promise) {
    state.promise = new MongoClient(uri, OPTIONS)
      .connect()
      .then((client) => client.db(dbName))
      .catch((error) => {
        state.promise = null;
        state.failedAt = Date.now();

        console.error(`[db] could not reach the database: ${safeReason(error)}`);

        throw new DatabaseUnavailableError();
      });
  }

  return state.promise;
};
