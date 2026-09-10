import { orderLookupSchema } from "@/lib/schemas/order";
import { findOrderByReference, orderSecret } from "@/lib/api/orders";
import { signOrderToken } from "@/lib/utils/order-token";
import { createLimiter, tooManyRequests } from "@/lib/rate-limit";
import RATE_LIMITS from "@/lib/rate-limits";
import requestIp from "@/lib/utils/request-ip";
import { sameOrigin, badOrigin } from "@/lib/api/origin";

const limiter = createLimiter(RATE_LIMITS.orderLookup);

const notFound = () =>
  Response.json(
    { error: "No order matches that reference and email" },
    { status: 404 }
  );

export const POST = async (request) => {
  if (!sameOrigin(request)) return badOrigin();

  const gate = await limiter.check(requestIp(request));

  if (!gate.ok) return tooManyRequests(gate.resetAt);

  let payload;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Malformed request" }, { status: 400 });
  }

  const parsed = orderLookupSchema.safeParse(payload);

  if (!parsed.success)
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid lookup" },
      { status: 422 }
    );

  const { reference, email } = parsed.data;
  const order = await findOrderByReference(reference.trim().toUpperCase());

  if (!order) return notFound();
  if (order.email !== email.trim().toLowerCase()) return notFound();

  return Response.json({
    reference: order.reference,
    status: order.status,
    createdAt: order.createdAt,
    totals: order.totals,
    items: order.items,
    payment: { method: order.payment.method, status: order.payment.status },
    token: signOrderToken(order.reference, orderSecret()),
  });
};
