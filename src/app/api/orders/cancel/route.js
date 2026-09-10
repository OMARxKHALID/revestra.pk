import { orderCancelSchema } from "@/lib/schemas/order";
import { cancelOwnOrder, captureOrderCancelled } from "@/lib/api/fulfilment";
import { findOrderByReference, orderSecret } from "@/lib/api/orders";
import { verifyOrderToken } from "@/lib/utils/order-token";
import { createLimiter } from "@/lib/rate-limit";
import RATE_LIMITS from "@/lib/rate-limits";
import { guardRequest } from "@/lib/api/request";
import { optionalSession } from "@/lib/session";

const limiter = createLimiter(RATE_LIMITS.orderCancel);

const notFound = () =>
  Response.json({ error: "No order matches that reference" }, { status: 404 });

export const POST = async (request) => {
  const gated = await guardRequest(request, {
    limiter,
    schema: orderCancelSchema,
    fallback: "Invalid cancellation",
  });

  if (gated.response) return gated.response;

  const { reference, token } = gated.data;
  const order = await findOrderByReference(reference);

  if (!order) return notFound();

  const session = await optionalSession();
  const owns = Boolean(order.userId) && order.userId === session?.user?.id;
  const claim = verifyOrderToken(token, orderSecret());

  if (!owns && claim?.reference !== reference) return notFound();

  const cancelled = await cancelOwnOrder(reference);

  if (!cancelled.ok)
    return Response.json({ error: cancelled.error }, { status: 409 });

  await captureOrderCancelled(cancelled.order);

  return Response.json({ reference, status: cancelled.order.status });
};
