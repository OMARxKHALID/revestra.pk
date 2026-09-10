import "server-only";
import { siteUrl } from "@/lib/payments/config";

export const sameOrigin = (request) => {
  const origin = request.headers.get("origin");

  if (!origin) return false;

  try {
    return new URL(origin).origin === new URL(siteUrl()).origin;
  } catch {
    return false;
  }
};

export const badOrigin = () =>
  Response.json({ error: "Bad origin" }, { status: 403 });
