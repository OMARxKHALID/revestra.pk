import { orderSchema } from "@/lib/schemas/order";
import { getAllProducts } from "@/lib/api/products";
import { buildReference, insertOrder, orderSecret } from "@/lib/api/orders";
import { signOrderToken } from "@/lib/utils/order-token";
import { getPromoByCode, recordRedemption } from "@/lib/api/promos";
import { reserveStock, releaseStock, markSold } from "@/lib/api/inventory";
import { priceOrderLines, subtotalOf } from "@/lib/utils/order-lines";
import { promoProblem } from "@/lib/utils/promo-validity";
import { buildTotals } from "@/lib/utils/totals";
import { createRateLimiter, tooManyRequests } from "@/lib/rate-limit";
import requestIp from "@/lib/utils/request-ip";
import { sendOrderConfirmation } from "@/lib/email";
import { siteUrl } from "@/lib/payments/config";
import { optionalSession } from "@/lib/session";
import { listMethods } from "@/lib/payments";

const limiter = createRateLimiter({ limit: 10, windowMs: 10 * 60 * 1000 });

export const POST = async (request) => {
  const gate = limiter.check(requestIp(request));

  if (!gate.ok) return tooManyRequests(gate.resetAt);

  let payload;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Malformed request" }, { status: 400 });
  }

  const parsed = orderSchema.safeParse(payload);

  if (!parsed.success)
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid order" },
      { status: 422 }
    );

  const { shipping, items, promoCode, rateId, method } = parsed.data;

  const available = listMethods().find(
    (option) => option.id === method && option.available
  );

  if (!available)
    return Response.json(
      { error: "That payment method is not available right now" },
      { status: 409 }
    );

  const catalogue = await getAllProducts();
  const priced = priceOrderLines(catalogue, items);

  if (!priced.ok) return Response.json({ error: priced.error }, { status: 409 });

  const subtotalCents = subtotalOf(priced.lines);
  let promo = null;

  if (promoCode) {
    promo = await getPromoByCode(promoCode);
    const problem = promoProblem(promo, subtotalCents);

    if (problem) return Response.json({ error: problem }, { status: 422 });
  }

  const totals = buildTotals({ subtotalCents, promo, rateId });
  const reservation = await reserveStock(priced.lines);

  if (!reservation.ok)
    return Response.json({ error: reservation.error }, { status: 409 });

  const session = await optionalSession();

  const order = {
    reference: buildReference(),
    currency: "PKR",
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
      status: method === "cod" ? "not_required" : "pending",
      amountCents: totals.totalCents,
      verification: "none",
      providerTxnId: null,
      settledAt: null,
      attempts: [],
    },
    status: method === "cod" ? "received" : "pending_payment",
    history: [{ status: method === "cod" ? "received" : "pending_payment", at: new Date() }],
    stockReserved: reservation.reserved,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let persisted = false;

  try {
    ({ persisted } = await insertOrder(order));
  } catch (error) {
    console.error(
      `[orders] could not store ${order.reference}: ${error.message}`
    );

    if (reservation.reserved) await releaseStock(priced.lines);

    return Response.json(
      {
        error:
          "We could not record your order. Nothing was charged — please try again.",
      },
      { status: 503 }
    );
  }

  if (persisted && method === "cod") await markSold(priced.lines);

  if (promo && persisted && method === "cod")
    await recordRedemption(promo.code);

  const token = signOrderToken(order.reference, orderSecret());
  const trackUrl = `${siteUrl()}/orders/${order.reference}?t=${encodeURIComponent(token)}`;

  if (method === "cod" && persisted)
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
      method === "cod"
        ? null
        : `/checkout/pay/${order.reference}?t=${encodeURIComponent(token)}`,
  });
};
