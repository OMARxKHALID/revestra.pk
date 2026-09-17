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
import { sendOrderConfirmation } from "@/lib/email";
import { alertStoreAboutOrder } from "@/lib/api/order-alert";
import { signOrderToken } from "@/lib/utils/order-token";
import { easypaisaConfig, siteUrl } from "@/lib/payments/config";
import reportPaymentAnomaly from "@/lib/api/payment-anomaly";

export const dynamic = "force-dynamic";

const seeOther = (path) =>
  Response.redirect(new URL(path, siteUrl()).toString(), 303);

const escapeAttribute = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const confirmPage = (authToken) => {
  const { confirmAction } = easypaisaConfig();
  const postBackURL = `${siteUrl()}/api/payments/easypaisa/callback`;

  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Confirming payment</title></head><body onload="document.forms[0].submit()"><form method="post" action="${escapeAttribute(
      confirmAction
    )}"><input type="hidden" name="auth_token" value="${escapeAttribute(
      authToken
    )}"><input type="hidden" name="postBackURL" value="${escapeAttribute(
      postBackURL
    )}"><button type="submit">Confirm payment</button></form></body></html>`,
    { headers: { "content-type": "text/html; charset=utf-8" } }
  );
};

const settle = async (request) => {
  const easypaisa = getAdapter(PAYMENT_METHOD.easypaisa);
  const fields = await easypaisa.parseCallback(request);

  if (fields.auth_token && !fields.status) return confirmPage(fields.auth_token);

  const result = await easypaisa.verifyCallback({ fields });

  if (!result.attemptRef) return seeOther("/checkout?payment=unknown");

  const order = await findOrderByAttemptRef(result.attemptRef);

  if (!order) {
    console.warn(`[easypaisa] callback for unknown attempt ${result.attemptRef}`);
    return seeOther("/checkout?payment=unknown");
  }

  const token = encodeURIComponent(
    signOrderToken(order.reference, orderSecret())
  );

  if (order.payment.status !== PAYMENT_STATUS.pending) {
    const paidLate =
      result.ok &&
      result.status === PAYMENT_STATUS.paid &&
      order.payment.status !== PAYMENT_STATUS.paid;

    if (paidLate)
      await reportPaymentAnomaly(
        "easypaisa",
        `paid after the order was closed as ${order.status}`,
        order,
        result
      );

    return seeOther(`/orders/${order.reference}?t=${token}`);
  }

  if (!result.ok) {
    await reportPaymentAnomaly(
      "easypaisa",
      `settlement unverified (${result.verification})`,
      order,
      result
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

  const amountMatches = result.amountCents === order.payment.amountCents;
  const paid = result.status === PAYMENT_STATUS.paid && amountMatches;

  if (result.status === PAYMENT_STATUS.paid && !amountMatches)
    await reportPaymentAnomaly("easypaisa", "amount mismatch", order, result);

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
    alertStoreAboutOrder(order);
    await sendOrderConfirmation(
      { ...order, payment: { ...order.payment, status: PAYMENT_STATUS.paid } },
      `${siteUrl()}/orders/${order.reference}?t=${token}`
    );
  }

  return seeOther(`/orders/${order.reference}?t=${token}`);
};

export const POST = settle;
export const GET = settle;
