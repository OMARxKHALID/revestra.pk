import { z } from "zod";
import { findOrderByReference, orderSecret } from "@/lib/api/orders";
import { signOrderToken } from "@/lib/utils/order-token";
import { createRateLimiter, tooManyRequests } from "@/lib/rate-limit";
import requestIp from "@/lib/utils/request-ip";

const limiter = createRateLimiter({ limit: 10, windowMs: 10 * 60 * 1000 });

const lookupSchema = z.object({
  reference: z.string().trim().min(4),
  email: z.email("Enter the email you ordered with"),
});

const notFound = () =>
  Response.json(
    { error: "No order matches that reference and email" },
    { status: 404 }
  );

export const POST = async (request) => {
  const gate = limiter.check(requestIp(request));

  if (!gate.ok) return tooManyRequests(gate.resetAt);

  let payload;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Malformed request" }, { status: 400 });
  }

  const parsed = lookupSchema.safeParse(payload);

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
