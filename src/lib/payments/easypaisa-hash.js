import { createCipheriv } from "node:crypto";

export const HASH_KEY_LENGTH = 16;

export const hashInput = (params) =>
  Object.keys(params)
    .filter((key) => {
      const value = params[key];
      return value !== undefined && value !== null && String(value) !== "";
    })
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

export const buildMerchantHash = (params, hashKey) => {
  if (!hashKey) throw new Error("An Easypaisa hash key is required");

  const key = Buffer.from(hashKey, "utf8");

  if (key.length !== HASH_KEY_LENGTH)
    throw new Error(
      `An Easypaisa hash key must be exactly ${HASH_KEY_LENGTH} bytes, got ${key.length}`
    );

  const cipher = createCipheriv("aes-128-ecb", key, null);

  return Buffer.concat([
    cipher.update(hashInput(params), "utf8"),
    cipher.final(),
  ]).toString("base64");
};

export const toEasypaisaAmount = (cents) =>
  (cents / 100).toFixed(cents % 100 === 0 ? 1 : 2);
