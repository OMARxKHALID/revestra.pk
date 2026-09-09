import { createHmac, timingSafeEqual } from "node:crypto";

const HASH_FIELD = "pp_SecureHash";

export const hashableFields = (fields) =>
  Object.keys(fields)
    .filter((key) => key.startsWith("pp") && key !== HASH_FIELD)
    .filter((key) => {
      const value = fields[key];
      return value !== undefined && value !== null && String(value) !== "";
    })
    .sort();

export const hashInput = (fields, integritySalt) =>
  [integritySalt, ...hashableFields(fields).map((key) => String(fields[key]))].join(
    "&"
  );

export const buildSecureHash = (fields, integritySalt) => {
  if (!integritySalt) throw new Error("A JazzCash integrity salt is required");

  return createHmac("sha256", integritySalt)
    .update(hashInput(fields, integritySalt), "utf8")
    .digest("hex");
};

export const verifySecureHash = (fields, integritySalt) => {
  const received = String(fields[HASH_FIELD] ?? "");

  if (!received) return false;

  const expected = buildSecureHash(fields, integritySalt);

  if (received.length !== expected.length) return false;

  return timingSafeEqual(
    Buffer.from(received.toLowerCase(), "utf8"),
    Buffer.from(expected.toLowerCase(), "utf8")
  );
};
