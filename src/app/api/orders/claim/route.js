import { orderLookupSchema } from "@/lib/schemas/order";
import { auth } from "@/auth";
import { claimOrder } from "@/lib/api/orders";
import { createLimiter, tooManyRequests } from "@/lib/rate-limit";
import RATE_LIMITS from "@/lib/rate-limits";
import requestIp from "@/lib/utils/request-ip";
import { sameOrigin, badOrigin } from "@/lib/api/origin";

const limiter = createLimiter(RATE_LIMITS.orderClaim);

export const POST = async (request) => {
  if (!sameOrigin(request)) return badOrigin();

  const gate = await limiter.check(requestIp(request));

  if (!gate.ok) return tooManyRequests(gate.resetAt);

  const session = await auth();

  if (!session?.user?.id)
    return Response.json({ error: "Sign in first" }, { status: 401 });

  let payload;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Malformed request" }, { status: 400 });
  }

  const parsed = orderLookupSchema.safeParse(payload);

  if (!parsed.success)
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid claim" },
      { status: 422 }
    );

  const order = await claimOrder(
    parsed.data.reference.trim().toUpperCase(),
    parsed.data.email,
    session.user.id
  );

  if (!order)
    return Response.json(
      { error: "No unclaimed order matches that reference and email" },
      { status: 404 }
    );

  return Response.json({ reference: order.reference });
};
