import easypaisa from "@/lib/payments/easypaisa";
import {
  findOrderByAttemptRef,
  orderSecret,
  settlePayment,
} from "@/lib/api/orders";
import { releaseStock, markSold } from "@/lib/api/inventory";
import { recordRedemption } from "@/lib/api/promos";
import { signOrderToken } from "@/lib/utils/order-token";
import { easypaisaConfig, siteUrl } from "@/lib/payments/config";

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
  const fields = await easypaisa.parseCallback(request);

  if (fields.auth_token && !fields.status) return confirmPage(fields.auth_token);

  const result = easypaisa.verifyCallback({ fields });

  if (!result.attemptRef) return seeOther("/checkout?payment=unknown");

  const order = await findOrderByAttemptRef(result.attemptRef);

  if (!order) {
    console.warn(`[easypaisa] callback for unknown attempt ${result.attemptRef}`);
    return seeOther("/checkout?payment=unknown");
  }

  const token = encodeURIComponent(
    signOrderToken(order.reference, orderSecret())
  );

  if (order.payment.status !== "pending")
    return seeOther(`/orders/${order.reference}?t=${token}`);

  const amountMatches =
    result.amountCents === 0 || result.amountCents === order.payment.amountCents;
  const paid = result.status === "paid" && amountMatches;

  if (result.status === "paid" && !amountMatches)
    console.error(
      `[easypaisa] amount mismatch on ${order.reference}: gateway ${result.amountCents}, order ${order.payment.amountCents}`
    );

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
