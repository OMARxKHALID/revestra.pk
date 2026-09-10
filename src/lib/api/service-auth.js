import "server-only";
import { timingSafeEqual } from "node:crypto";
import { cronSecret } from "@/lib/secrets";

export const CRON_HEADER = "x-cron-secret";

const matches = (offered, expected) => {
  const a = Buffer.from(offered);
  const b = Buffer.from(expected);

  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
};

const notFound = () => Response.json({ error: "Not found" }, { status: 404 });

export const cronGuard = (request) => {
  const expected = cronSecret();

  if (!expected) {
    console.error("[cron] CRON_SECRET is not set — refusing the request");

    return { response: notFound() };
  }

  const offered = request.headers.get(CRON_HEADER) ?? "";

  if (!offered || !matches(offered, expected)) return { response: notFound() };

  return { ok: true };
};
