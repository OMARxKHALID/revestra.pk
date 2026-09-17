import { createHmac, timingSafeEqual } from "node:crypto";

const normalise = (email) => String(email ?? "").trim().toLowerCase();

export const signSubscriber = (email, secret) => {
  if (!secret) throw new Error("A subscriber token secret is required");

  return createHmac("sha256", secret)
    .update(`newsletter:${normalise(email)}`, "utf8")
    .digest("base64url");
};

export const verifySubscriber = (email, token, secret) => {
  if (!email || !token || !secret) return false;

  const expected = signSubscriber(email, secret);

  if (String(token).length !== expected.length) return false;

  return timingSafeEqual(
    Buffer.from(String(token), "utf8"),
    Buffer.from(expected, "utf8")
  );
};
