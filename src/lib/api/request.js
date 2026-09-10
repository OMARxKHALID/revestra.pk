import "server-only";
import { sameOrigin, badOrigin } from "@/lib/api/origin";
import { tooManyRequests } from "@/lib/rate-limit";
import requestIp from "@/lib/utils/request-ip";

export const gateRequest = async (request, limiter, { prefix = "" } = {}) => {
  if (!sameOrigin(request)) return { response: badOrigin() };

  const key = prefix ? `${prefix}|${requestIp(request)}` : requestIp(request);
  const hit = await limiter.check(key);

  if (!hit.ok) return { response: tooManyRequests(hit.resetAt) };

  return {};
};

export const readBody = async (request, schema, fallback = "Invalid request") => {
  let payload;

  try {
    payload = await request.json();
  } catch {
    return {
      response: Response.json({ error: "Malformed request" }, { status: 400 }),
    };
  }

  const parsed = schema.safeParse(payload);

  if (!parsed.success)
    return {
      response: Response.json(
        { error: parsed.error.issues[0]?.message ?? fallback },
        { status: 422 }
      ),
    };

  return { data: parsed.data };
};

export const guardRequest = async (
  request,
  { limiter, schema, prefix = "", fallback = "Invalid request" }
) => {
  const gated = await gateRequest(request, limiter, { prefix });

  if (gated.response) return gated;

  return readBody(request, schema, fallback);
};
