import jazzcash from "@/lib/payments/jazzcash";
import {
  findOrderByAttemptRef,
  orderSecret,
  recordAttempt,
  settlePayment,
} from "@/lib/api/orders";
import { releaseStock, markSold } from "@/lib/api/inventory";
import { recordRedemption } from "@/lib/api/promos";
import { signOrderToken } from "@/lib/utils/order-token";
import { siteUrl } from "@/lib/payments/config";

export const dynamic = "force-dynamic";

const seeOther = (path) =>
  Response.redirect(new URL(path, siteUrl()).toString(), 303);

const settle = async (request) => {
  const fields = await jazzcash.parseCallback(request);
  const result = jazzcash.verifyCallback({ fields });

  if (!result.attemptRef) return seeOther("/checkout?payment=unknown");

  const order = await findOrderByAttemptRef(result.attemptRef);

  if (!order) {
    console.warn(`[jazzcash] callback for unknown attempt ${result.attemptRef}`);
    return seeOther("/checkout?payment=unknown");
  }

  const token = encodeURIComponent(
    signOrderToken(order.reference, orderSecret())
  );

  if (order.payment.status !== "pending")
    return seeOther(`/orders/${order.reference}?t=${token}`);

  const amountMatches = result.amountCents === order.payment.amountCents;
  const paid = result.status === "paid" && result.ok && amountMatches;

  if (result.status === "paid" && !amountMatches)
    console.error(
      `[jazzcash] amount mismatch on ${order.reference}: gateway ${result.amountCents}, order ${order.payment.amountCents}`
    );

  if (!result.ok) {
    console.error(
      `[jazzcash] secure hash did not verify for ${order.reference} — leaving it pending for manual reconciliation`
    );

    await recordAttempt(order.reference, {
      ref: result.attemptRef,
      at: new Date(),
      status: "unverified",
      code: result.code,
      message: result.message,
      raw: result.raw,
    });

    return seeOther(`/orders/${order.reference}?t=${token}`);
  }

  if (result.status === "pending") {
    await recordAttempt(order.reference, {
      ref: result.attemptRef,
      at: new Date(),
      status: "pending",
      code: result.code,
      message: result.message,
      raw: result.raw,
    });

    return seeOther(`/orders/${order.reference}?t=${token}`);
  }

  const settled = await settlePayment({
    attemptRef: result.attemptRef,
    status: paid ? "paid" : "failed",
    orderStatus: paid ? "received" : "failed",
    providerTxnId: result.providerTxnId,
    verification: result.verification,
    attempt: {
      ref: result.attemptRef,
      at: new Date(),
      status: paid ? "paid" : "failed",
      code: result.code,
      message: result.message,
      raw: result.raw,
    },
  });

  if (settled && !paid && order.stockReserved) await releaseStock(order.items);

  if (settled && paid) await markSold(order.items);

  if (settled && paid && order.promo) await recordRedemption(order.promo.code);

  return seeOther(`/orders/${order.reference}?t=${token}`);
};

export const POST = settle;
export const GET = settle;
