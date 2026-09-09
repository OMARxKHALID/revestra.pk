import { z } from "zod";
import { auth } from "@/auth";
import { claimOrder } from "@/lib/api/orders";
import { createRateLimiter, tooManyRequests } from "@/lib/rate-limit";
import requestIp from "@/lib/utils/request-ip";

const limiter = createRateLimiter({ limit: 10, windowMs: 10 * 60 * 1000 });

const claimSchema = z.object({
  reference: z.string().trim().min(4),
  email: z.email("Enter the email you ordered with"),
});

export const POST = async (request) => {
  const gate = limiter.check(requestIp(request));

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

  const parsed = claimSchema.safeParse(payload);

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
