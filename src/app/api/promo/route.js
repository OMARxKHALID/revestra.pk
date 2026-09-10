import { promoRequestSchema } from "@/lib/schemas/promo";
import { getPromoByCode } from "@/lib/api/promos";
import { promoProblem } from "@/lib/utils/promo-validity";
import { getSettings } from "@/lib/api/settings";
import { buildTotals } from "@/lib/utils/totals";
import { createLimiter, tooManyRequests } from "@/lib/rate-limit";
import RATE_LIMITS from "@/lib/rate-limits";
import requestIp from "@/lib/utils/request-ip";
import { sameOrigin, badOrigin } from "@/lib/api/origin";

const limiter = createLimiter(RATE_LIMITS.promo);

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

  const { commerce } = await getSettings();
  const totals = buildTotals({ subtotalCents, promo, rateId, commerce });

  return Response.json({
    promo: { code: promo.code, kind: promo.kind, value: promo.value },
    totals,
  });
};
