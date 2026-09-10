import {
  ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
} from "@/lib/schemas/order";
import { getAdapter } from "@/lib/payments";
import {
  findOrderByAttemptRef,
  orderSecret,
  recordAttempt,
  settlePayment,
} from "@/lib/api/orders";
import { releaseStock } from "@/lib/api/inventory";
import { completeSale, captureOrderCompleted } from "@/lib/api/fulfilment";
import { signOrderToken } from "@/lib/utils/order-token";
import { siteUrl } from "@/lib/payments/config";

export const dynamic = "force-dynamic";

const seeOther = (path) =>
  Response.redirect(new URL(path, siteUrl()).toString(), 303);

const settle = async (request) => {
  const jazzcash = getAdapter(PAYMENT_METHOD.jazzcash);
  const fields = await jazzcash.parseCallback(request);
  const result = await jazzcash.verifyCallback({ fields });

  if (!result.attemptRef) return seeOther("/checkout?payment=unknown");

  const order = await findOrderByAttemptRef(result.attemptRef);

  if (!order) {
    console.warn(`[jazzcash] callback for unknown attempt ${result.attemptRef}`);
    return seeOther("/checkout?payment=unknown");
  }

  const token = encodeURIComponent(
    signOrderToken(order.reference, orderSecret())
  );

  if (order.payment.status !== PAYMENT_STATUS.pending)
    return seeOther(`/orders/${order.reference}?t=${token}`);

  const amountMatches = result.amountCents === order.payment.amountCents;
  const paid =
    result.status === PAYMENT_STATUS.paid && result.ok && amountMatches;

  if (result.status === PAYMENT_STATUS.paid && !amountMatches)
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

  if (result.status === PAYMENT_STATUS.pending) {
    await recordAttempt(order.reference, {
      ref: result.attemptRef,
      at: new Date(),
      status: PAYMENT_STATUS.pending,
      code: result.code,
      message: result.message,
      raw: result.raw,
    });

    return seeOther(`/orders/${order.reference}?t=${token}`);
  }

  const settled = await settlePayment({
    attemptRef: result.attemptRef,
    status: paid ? PAYMENT_STATUS.paid : PAYMENT_STATUS.failed,
    orderStatus: paid ? ORDER_STATUS.received : ORDER_STATUS.failed,
    providerTxnId: result.providerTxnId,
    verification: result.verification,
    attempt: {
      ref: result.attemptRef,
      at: new Date(),
      status: paid ? PAYMENT_STATUS.paid : PAYMENT_STATUS.failed,
      code: result.code,
      message: result.message,
      raw: result.raw,
    },
  });

  if (settled && !paid && order.stockReserved)
    await releaseStock(order.items, order.reference);

  if (settled && paid) {
    await completeSale(order);
    await captureOrderCompleted({ ...order, status: ORDER_STATUS.received });
  }

  return seeOther(`/orders/${order.reference}?t=${token}`);
};

export const POST = settle;
export const GET = settle;
