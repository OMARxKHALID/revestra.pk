import "server-only";
import { randomUUID } from "node:crypto";
import { Binary } from "mongodb";
import { getDb } from "@/lib/db";

const COLLECTION = "review_images";

export const MAX_IMAGES = 3;
export const MAX_BYTES = 1_500_000;

const SIGNATURES = [
  { type: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { type: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { type: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46] },
];

export const sniffType = (buffer) => {
  const match = SIGNATURES.find(({ bytes }) =>
    bytes.every((byte, index) => buffer[index] === byte)
  );

  if (!match) return null;
  if (match.type !== "image/webp") return match.type;

  const isWebp = buffer.subarray(8, 12).toString("ascii") === "WEBP";

  return isWebp ? "image/webp" : null;
};

export const decodeDataUrl = (value) => {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(
    String(value)
  );

  if (!match) return { ok: false, error: "Only JPEG, PNG or WebP images" };

  const buffer = Buffer.from(match[2], "base64");

  if (buffer.length === 0) return { ok: false, error: "That image was empty" };

  if (buffer.length > MAX_BYTES)
    return { ok: false, error: "Each image must be under 1.5 MB" };

  const type = sniffType(buffer);

  if (!type || type !== match[1])
    return { ok: false, error: "That file is not a real image" };

  return { ok: true, buffer, type };
};

export const storeImages = async (values) => {
  if (!Array.isArray(values) || values.length === 0) return { ok: true, ids: [] };

  if (values.length > MAX_IMAGES)
    return { ok: false, error: `Up to ${MAX_IMAGES} photos, please` };

  const db = await getDb();

  if (!db) return { ok: true, ids: [] };

  const documents = [];

  for (const value of values) {
    const decoded = decodeDataUrl(value);

    if (!decoded.ok || !decoded.buffer)
      return { ok: false, error: decoded.error ?? "That image could not be read" };

    documents.push({
      _id: randomUUID(),
      data: new Binary(decoded.buffer),
      type: decoded.type,
      bytes: decoded.buffer.length,
      createdAt: new Date(),
    });
  }

  await db.collection(COLLECTION).insertMany(documents);

  return { ok: true, ids: documents.map(({ _id }) => _id) };
};

export const getImage = async (id) => {
  const db = await getDb();

  if (!db) return null;

  const found = await db.collection(COLLECTION).findOne({ _id: id });

  if (!found) return null;

  return { buffer: Buffer.from(found.data.buffer), type: found.type };
};
