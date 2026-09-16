import { createHmac, timingSafeEqual } from "node:crypto";

const DEFAULT_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const sign = (payload, secret) =>
  createHmac("sha256", secret).update(payload, "utf8").digest("base64url");

export const signOrderToken = (
  reference,
  secret,
  expiresAt = Date.now() + DEFAULT_TTL_MS
) => {
  if (!secret) throw new Error("An order token secret is required");

  const payload = `${reference}.${expiresAt}`;

  return `${Buffer.from(payload, "utf8").toString("base64url")}.${sign(
    payload,
    secret
  )}`;
};

export const verifyOrderToken = (token, secret, now = Date.now()) => {
  if (!token || !secret) return null;

  const [encoded, signature] = String(token).split(".");

  if (!encoded || !signature) return null;

  let payload;

  try {
    payload = Buffer.from(encoded, "base64url").toString("utf8");
  } catch {
    return null;
  }

  const expected = sign(payload, secret);

  if (signature.length !== expected.length) return null;

  if (
    !timingSafeEqual(
      Buffer.from(signature, "utf8"),
      Buffer.from(expected, "utf8")
    )
  )
    return null;

  const separator = payload.lastIndexOf(".");
  const reference = payload.slice(0, separator);
  const expiresAt = Number(payload.slice(separator + 1));

  if (!reference || !Number.isFinite(expiresAt)) return null;
  if (expiresAt < now) return null;

  return { reference, expiresAt };
};
