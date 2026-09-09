import "server-only";
import { hash, compare } from "bcryptjs";
import { getDb, isDatabaseConfigured } from "@/lib/db";

const COLLECTION = "users";
const COST = 12;

const DUMMY_HASH =
  "$2b$12$C6UzMDM.H6dfI/f/IKcEe.9dQdRSGXi.tHnLQTVQ2fO7ZBhAQOJEO";

const toPublicUser = (document) =>
  document
    ? {
        id: String(document._id),
        email: document.email,
        name: document.name,
        role: document.role ?? "customer",
        wishlist: document.wishlist ?? [],
      }
    : null;

export const authIsAvailable = () => isDatabaseConfigured();

const collection = async () => {
  const db = await getDb();
  return db ? db.collection(COLLECTION) : null;
};

export const findUserByEmail = async (email) => {
  const users = await collection();

  if (!users) return null;

  return users.findOne({ email: email.trim().toLowerCase() });
};

export const getPublicUserByEmail = async (email) =>
  toPublicUser(await findUserByEmail(email));

export const createUser = async ({ name, email, password }) => {
  const users = await collection();

  if (!users) throw new Error("No database is configured");

  const normalised = email.trim().toLowerCase();
  const existing = await users.findOne({ email: normalised });

  if (existing) return { ok: false, reason: "taken" };

  const now = new Date();

  const document = {
    email: normalised,
    name: name.trim(),
    passwordHash: await hash(password, COST),
    role: "customer",
    wishlist: [],
    emailVerified: null,
    createdAt: now,
    updatedAt: now,
  };

  const { insertedId } = await users.insertOne(document);

  return { ok: true, user: toPublicUser({ ...document, _id: insertedId }) };
};

export const verifyCredentials = async (email, password) => {
  const document = await findUserByEmail(email);

  if (!document) {
    await compare(password, DUMMY_HASH);
    return null;
  }

  const matches = await compare(password, document.passwordHash);

  if (!matches) return null;

  return toPublicUser(document);
};

const objectId = async (userId) => {
  const { ObjectId } = await import("mongodb");

  if (!ObjectId.isValid(userId)) return null;

  return new ObjectId(userId);
};

export const setWishlist = async (userId, wishlist) => {
  const users = await collection();
  const id = await objectId(userId);

  if (!users || !id) return [];

  await users.updateOne(
    { _id: id },
    { $set: { wishlist, updatedAt: new Date() } }
  );

  return wishlist;
};

export const getWishlist = async (userId) => {
  const users = await collection();
  const id = await objectId(userId);

  if (!users || !id) return [];

  const document = await users.findOne(
    { _id: id },
    { projection: { wishlist: 1 } }
  );

  return document?.wishlist ?? [];
};
