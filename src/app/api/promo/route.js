import { promoRequestSchema } from "@/lib/schemas/promo";
import { getPromoByCode } from "@/lib/api/promos";
import { promoProblem } from "@/lib/utils/promo-validity";
import { getSettings } from "@/lib/api/settings";
import { buildTotals } from "@/lib/utils/totals";
import { createLimiter } from "@/lib/rate-limit";
import RATE_LIMITS from "@/lib/rate-limits";
import { guardRequest } from "@/lib/api/request";

const limiter = createLimiter(RATE_LIMITS.promo);

export const POST = async (request) => {
  const gated = await guardRequest(request, {
    limiter,
    schema: promoRequestSchema,
    fallback: "Invalid code",
  });

  if (gated.response) return gated.response;

  const { code, subtotalCents, rateId } = gated.data;
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
