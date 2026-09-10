import {
  ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  orderSchema,
} from "@/lib/schemas/order";
import { getSellableProducts } from "@/lib/api/products";
import { buildReference, insertOrder, orderSecret } from "@/lib/api/orders";
import { signOrderToken } from "@/lib/utils/order-token";
import { getPromoByCode } from "@/lib/api/promos";
import { reserveStock, releaseStock } from "@/lib/api/inventory";
import { completeSale } from "@/lib/api/fulfilment";
import { priceOrderLines, subtotalOf } from "@/lib/utils/order-lines";
import { CURRENCY } from "@/lib/utils/price";
import { promoProblem } from "@/lib/utils/promo-validity";
import { getSettings } from "@/lib/api/settings";
import { buildTotals } from "@/lib/utils/totals";
import { createLimiter } from "@/lib/rate-limit";
import RATE_LIMITS from "@/lib/rate-limits";
import { guardRequest } from "@/lib/api/request";
import { sendOrderConfirmation } from "@/lib/email";
import { siteUrl } from "@/lib/payments/config";
import { optionalSession } from "@/lib/session";
import { listMethods } from "@/lib/payments";

const limiter = createLimiter(RATE_LIMITS.order);

export const POST = async (request) => {
  const gated = await guardRequest(request, {
    limiter,
    schema: orderSchema,
    fallback: "Invalid order",
  });

  if (gated.response) return gated.response;

  const { shipping, items, promoCode, rateId, method } = gated.data;

  const settings = await getSettings();

  const available = listMethods(settings).find(
    (option) => option.id === method && option.available
  );

  if (!available)
    return Response.json(
      { error: "That payment method is not available right now" },
      { status: 409 }
    );

  const catalogue = await getSellableProducts();
  const priced = priceOrderLines(catalogue, items);

  if (!priced.ok) return Response.json({ error: priced.error }, { status: 409 });

  const subtotalCents = subtotalOf(priced.lines);
  let promo = null;

  if (promoCode) {
    promo = await getPromoByCode(promoCode);
    const problem = promoProblem(promo, subtotalCents);

    if (problem) return Response.json({ error: problem }, { status: 422 });
  }

  const { commerce } = settings;
  const totals = buildTotals({ subtotalCents, promo, rateId, commerce });
  const reference = buildReference();
  const reservation = await reserveStock(priced.lines, {
    reference,
    holdFor: commerce.holdMinutes,
  });

  if (!reservation.ok)
    return Response.json({ error: reservation.error }, { status: 409 });

  const session = await optionalSession();
  const isCod = method === PAYMENT_METHOD.cod;
  const openingStatus = isCod
    ? ORDER_STATUS.received
    : ORDER_STATUS.pendingPayment;

  const order = {
    reference,
    currency: CURRENCY,
    userId: session?.user?.id ?? null,
    email: shipping.email.toLowerCase(),
    shipping,
    items: priced.lines,
    promo: promo
      ? {
          code: promo.code,
          kind: promo.kind,
          value: promo.value,
          discountCents: totals.discountCents,
        }
      : null,
    rateId,
    totals,
    subtotalCents,
    payment: {
      method,
      mode: null,
      status: isCod ? PAYMENT_STATUS.notRequired : PAYMENT_STATUS.pending,
      amountCents: totals.totalCents,
      verification: "none",
      providerTxnId: null,
      settledAt: null,
      attempts: [],
    },
    status: openingStatus,
    history: [{ status: openingStatus, at: new Date() }],
    promoRedeemed: false,
    stockReserved: reservation.reserved,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let persisted = false;
  let duplicate = false;

  try {
    ({ persisted, duplicate = false } = await insertOrder(order));
  } catch (error) {
    console.error(
      `[orders] could not store ${order.reference}: ${error.message}`
    );

    if (reservation.reserved) await releaseStock(priced.lines, reference);

    return Response.json(
      {
        error:
          "We could not record your order. Nothing was charged — please try again.",
      },
      { status: 503 }
    );
  }

  if (duplicate) {
    await releaseStock(priced.lines, reference);

    return Response.json(
      { error: "That order could not be recorded. Please try again." },
      { status: 409 }
    );
  }

  if (persisted && isCod) await completeSale(order, priced.lines);

  const token = signOrderToken(order.reference, orderSecret());
  const trackUrl = `${siteUrl()}/orders/${order.reference}?t=${encodeURIComponent(token)}`;

  if (isCod && persisted)
    await sendOrderConfirmation(order, trackUrl);

  return Response.json({
    reference: order.reference,
    totals,
    subtotalCents,
    items: priced.lines,
    method,
    status: order.status,
    persisted,
    token,
    payUrl:
      isCod
        ? null
        : `/checkout/pay/${order.reference}?t=${encodeURIComponent(token)}`,
  });
};
