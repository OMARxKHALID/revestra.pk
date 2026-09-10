import { orderLookupSchema } from "@/lib/schemas/order";
import { auth } from "@/auth";
import { claimOrder } from "@/lib/api/orders";
import { createLimiter } from "@/lib/rate-limit";
import RATE_LIMITS from "@/lib/rate-limits";
import { gateRequest, readBody } from "@/lib/api/request";

const limiter = createLimiter(RATE_LIMITS.orderClaim);

export const POST = async (request) => {
  const gated = await gateRequest(request, limiter);

  if (gated.response) return gated.response;

  const session = await auth();

  if (!session?.user?.id)
    return Response.json({ error: "Sign in first" }, { status: 401 });

  const body = await readBody(request, orderLookupSchema, "Invalid claim");

  if (body.response) return body.response;

  const order = await claimOrder(
    body.data.reference.trim().toUpperCase(),
    body.data.email,
    session.user.id
  );

  if (!order)
    return Response.json(
      { error: "No unclaimed order matches that reference and email" },
      { status: 404 }
    );

  return Response.json({ reference: order.reference });
};
