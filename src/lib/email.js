import { ORDER_STATUS, PAYMENT_METHOD } from "@/lib/schemas/order";
import { BRAND } from "@/lib/brand";
import { formatPrice } from "@/lib/utils/price";
import errorMessage from "@/lib/utils/error-message";

const apiKey = () => process.env.RESEND_API_KEY?.trim() || "";
const from = () =>
  process.env.EMAIL_FROM?.trim() || `${BRAND.name} <onboarding@resend.dev>`;

const isEmailConfigured = () => Boolean(apiKey());

const lines = (order) =>
  order.items
    .map(
      (item) =>
        `  ${item.name} — ${[item.size, item.condition].filter(Boolean).join(", ")} — ${formatPrice(item.unitCents)}`
    )
    .join("\n");

const orderConfirmationText = (order, trackUrl) =>
  [
    `Thanks for your order, ${order.shipping.name.split(" ")[0]}.`,
    "",
    `Reference: ${order.reference}`,
    "",
    lines(order),
    "",
    `Subtotal: ${formatPrice(order.totals.subtotalCents)}`,
    order.totals.discountCents > 0
      ? `Discount: −${formatPrice(order.totals.discountCents)}`
      : null,
    `Shipping: ${order.totals.shippingCents === 0 ? "Free" : formatPrice(order.totals.shippingCents)}`,
    `Total: ${formatPrice(order.totals.totalCents)}`,
    "",
    order.payment.method === PAYMENT_METHOD.cod
      ? "Payment: cash on delivery."
      : `Payment: ${order.payment.method}, ${order.payment.status}.`,
    "",
    `Track it: ${trackUrl}`,
    "",
    `— ${BRAND.name}`,
  ]
    .filter((line) => line !== null)
    .join("\n");

export const sendEmail = async ({ to, subject, text }) => {
  if (!isEmailConfigured()) {
    console.info(`[email] no RESEND_API_KEY set — would send to ${to}:\n${text}`);
    return { sent: false };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey());

    await resend.emails.send({ from: from(), to, subject, text });

    return { sent: true };
  } catch (error) {
    console.error(`[email] could not send to ${to}: ${errorMessage(error)}`);
    return { sent: false, error: errorMessage(error) };
  }
};

export const sendOrderConfirmation = async (order, trackUrl) =>
  sendEmail({
    to: order.email,
    subject: `${BRAND.name} — order ${order.reference}`,
    text: orderConfirmationText(order, trackUrl),
  });

const STATUS_LINES = {
  [ORDER_STATUS.processing]: "We are packing your order now.",
  [ORDER_STATUS.shipped]: "Your order is on its way.",
  [ORDER_STATUS.delivered]: "Your order has been delivered.",
  [ORDER_STATUS.cancelled]: "Your order has been cancelled.",
};

const trackingLines = (order) => {
  if (!order.tracking) return [];

  const { courier, number, url } = order.tracking;

  return [
    courier ? `Courier: ${courier}` : null,
    number ? `Tracking number: ${number}` : null,
    url ? `Track your parcel: ${url}` : null,
    "",
  ].filter((line) => line !== null);
};

const orderStatusText = (order, trackUrl) =>
  [
    `${order.shipping.name.split(" ")[0]}, an update on order ${order.reference}.`,
    "",
    STATUS_LINES[order.status] ?? `Its status is now ${order.status}.`,
    "",
    ...trackingLines(order),
    order.status === ORDER_STATUS.cancelled
      ? "Anything already paid will be refunded to the same account."
      : `Full details: ${trackUrl}`,
    "",
    `— ${BRAND.name}`,
  ].join("\n");

export const sendOrderStatusUpdate = async (order, trackUrl) => {
  if (!STATUS_LINES[order.status]) return { sent: false };

  return sendEmail({
    to: order.email,
    subject: `${BRAND.name} — order ${order.reference} is ${order.status}`,
    text: orderStatusText(order, trackUrl),
  });
};

const passwordResetText = (code, minutes) =>
  [
    "Someone asked to reset the password on your back-office account.",
    "",
    `Your code is ${code}`,
    "",
    `It expires in ${minutes} minutes and can be used once.`,
    "If this was not you, ignore this email — nothing has changed.",
    "",
    `— ${BRAND.name}`,
  ].join("\n");

export const sendPasswordReset = async (to, code, minutes) =>
  sendEmail({
    to,
    subject: `Your ${BRAND.name} password reset code`,
    text: passwordResetText(code, minutes),
  });
