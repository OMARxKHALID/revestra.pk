import "server-only";
import { hash, compare } from "bcryptjs";
import { ROLE } from "@/lib/roles";
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
        role: document.role ?? ROLE.customer,
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


export const createUser = async ({
  name,
  email,
  password,
  role = ROLE.customer,
}) => {
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
    role,
    wishlist: [],
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

export const getUserRole = async (userId) => {
  const users = await collection();
  const id = await objectId(userId);

  if (!users || !id) return { reachable: false, role: null };

  const document = await users.findOne(
    { _id: id },
    { projection: { role: 1, passwordChangedAt: 1 } }
  );

  if (!document)
    return { reachable: true, role: null, passwordChangedAt: null };

  return {
    reachable: true,
    role: document.role ?? ROLE.customer,
    passwordChangedAt: document.passwordChangedAt
      ? new Date(document.passwordChangedAt).getTime()
      : null,
  };
};

export const findUserById = async (userId) => {
  const users = await collection();
  const id = await objectId(userId);

  if (!users || !id) return null;

  return users.findOne({ _id: id });
};

export const updateProfile = async (userId, { name, email }) => {
  const users = await collection();
  const id = await objectId(userId);

  if (!users || !id) return { ok: false, error: "No such account" };

  const normalised = email.trim().toLowerCase();
  const clash = await users.findOne({ email: normalised, _id: { $ne: id } });

  if (clash) return { ok: false, error: "Another account already uses that email" };

  const result = await users.findOneAndUpdate(
    { _id: id },
    { $set: { name: name.trim(), email: normalised, updatedAt: new Date() } },
    { returnDocument: "after" }
  );

  if (!result) return { ok: false, error: "No such account" };

  return { ok: true, user: toPublicUser(result) };
};

export const changePassword = async (userId, current, next) => {
  const users = await collection();
  const id = await objectId(userId);

  if (!users || !id) return { ok: false, error: "No such account" };

  const document = await users.findOne({ _id: id });

  if (!document) return { ok: false, error: "No such account" };

  if (!(await compare(current, document.passwordHash)))
    return { ok: false, error: "That current password is not right" };

  await users.updateOne(
    { _id: id },
    {
      $set: {
        passwordHash: await hash(next, COST),
        passwordChangedAt: new Date(),
        updatedAt: new Date(),
      },
    }
  );

  return { ok: true };
};

export const setPasswordByEmail = async (email, password) => {
  const users = await collection();

  if (!users) return { ok: false, error: "No database is configured" };

  const result = await users.updateOne(
    { email: email.trim().toLowerCase() },
    {
      $set: {
        passwordHash: await hash(password, COST),
        passwordChangedAt: new Date(),
        updatedAt: new Date(),
      },
    }
  );

  if (result.matchedCount === 0) return { ok: false, error: "No such account" };

  return { ok: true };
};

export const getAccount = async (userId) => {
  const document = await findUserById(userId);

  if (!document) return null;

  return {
    name: document.name,
    email: document.email,
    address: document.address ?? null,
  };
};

export const setAddress = async (userId, address) => {
  const users = await collection();
  const id = await objectId(userId);

  if (!users || !id) return { ok: false, error: "No such account" };

  await users.updateOne(
    { _id: id },
    { $set: { address, updatedAt: new Date() } }
  );

  return { ok: true, address };
};

export const deleteAccount = async (userId, password) => {
  const users = await collection();
  const id = await objectId(userId);

  if (!users || !id) return { ok: false, error: "No such account" };

  const document = await users.findOne({ _id: id });

  if (!document) return { ok: false, error: "No such account" };

  if (!(await compare(password, document.passwordHash)))
    return { ok: false, error: "That password is not right" };

  const db = await getDb();
  const userId_ = String(document._id);

  await db
    .collection("orders")
    .updateMany({ userId: userId_ }, { $set: { userId: null } });
  await db
    .collection("reviews")
    .updateMany({ userId: userId_ }, { $set: { userId: null } });
  await db.collection("password_resets").deleteOne({ _id: document.email });
  await users.deleteOne({ _id: id });

  return { ok: true, email: document.email };
};
