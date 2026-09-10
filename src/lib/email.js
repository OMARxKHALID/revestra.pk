import { PAYMENT_METHOD } from "@/lib/schemas/order";
import { BRAND } from "@/lib/brand";
import { formatPrice } from "@/lib/utils/price";
import errorMessage from "@/lib/utils/error-message";

const apiKey = () => process.env.RESEND_API_KEY?.trim() || "";
const from = () =>
  process.env.EMAIL_FROM?.trim() || `${BRAND.name} <onboarding@resend.dev>`;

export const isEmailConfigured = () => Boolean(apiKey());

const lines = (order) =>
  order.items
    .map(
      (item) =>
        `  ${item.name} — ${[item.size, item.condition].filter(Boolean).join(", ")} — ${formatPrice(item.unitCents)}`
    )
    .join("\n");

export const orderConfirmationText = (order, trackUrl) =>
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

export const passwordResetText = (code, minutes) =>
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
