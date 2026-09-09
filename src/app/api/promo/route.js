import { promoRequestSchema } from "@/lib/schemas/promo";
import { getPromoByCode } from "@/lib/api/promos";
import { promoProblem } from "@/lib/utils/promo-validity";
import { buildTotals } from "@/lib/utils/totals";
import { createRateLimiter, tooManyRequests } from "@/lib/rate-limit";
import requestIp from "@/lib/utils/request-ip";

const limiter = createRateLimiter({ limit: 20, windowMs: 10 * 60 * 1000 });

export const POST = async (request) => {
  const gate = limiter.check(requestIp(request));

  if (!gate.ok) return tooManyRequests(gate.resetAt);

  let payload;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Malformed request" }, { status: 400 });
  }

  const parsed = promoRequestSchema.safeParse(payload);

  if (!parsed.success)
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid code" },
      { status: 422 }
    );

  const { code, subtotalCents, rateId } = parsed.data;
  const promo = await getPromoByCode(code);
  const problem = promoProblem(promo, subtotalCents);

  if (problem) return Response.json({ error: problem }, { status: 422 });

  const totals = buildTotals({ subtotalCents, promo, rateId });

  return Response.json({
    promo: { code: promo.code, kind: promo.kind, value: promo.value },
    totals,
  });
};
