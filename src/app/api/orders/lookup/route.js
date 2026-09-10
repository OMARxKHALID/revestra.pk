import { orderLookupSchema } from "@/lib/schemas/order";
import { findOrderByReference, orderSecret } from "@/lib/api/orders";
import { signOrderToken } from "@/lib/utils/order-token";
import { createLimiter } from "@/lib/rate-limit";
import RATE_LIMITS from "@/lib/rate-limits";
import { guardRequest } from "@/lib/api/request";

const limiter = createLimiter(RATE_LIMITS.orderLookup);

const notFound = () =>
  Response.json(
    { error: "No order matches that reference and email" },
    { status: 404 }
  );

export const POST = async (request) => {
  const gated = await guardRequest(request, {
    limiter,
    schema: orderLookupSchema,
    fallback: "Invalid lookup",
  });

  if (gated.response) return gated.response;

  const { reference, email } = gated.data;
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
