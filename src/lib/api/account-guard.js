import "server-only";
import { auth } from "@/auth";
import { sameOrigin, badOrigin } from "@/lib/api/origin";
import { createLimiter, tooManyRequests } from "@/lib/rate-limit";
import RATE_LIMITS from "@/lib/rate-limits";
import requestIp from "@/lib/utils/request-ip";

const limiter = createLimiter(RATE_LIMITS.account);

const signInFirst = () =>
  Response.json({ error: "Sign in first" }, { status: 401 });

export const accountGuard = async (request, { mutation = true } = {}) => {
  const session = await auth();

  if (!session?.user?.id) return { response: signInFirst() };

  if (mutation && !sameOrigin(request)) return { response: badOrigin() };

  const hit = await limiter.check(`account|${requestIp(request)}`);

  if (!hit.ok) return { response: tooManyRequests(hit.resetAt) };

  return { userId: session.user.id };
};
