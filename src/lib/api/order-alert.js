import "server-only";
import { after } from "next/server";
import { formatPrice } from "@/lib/utils/price";
import { whatsappNumber } from "@/lib/utils/whatsapp";
import { siteUrl } from "@/lib/payments/config";
import errorMessage from "@/lib/utils/error-message";
import { PAYMENT_METHOD_LABELS } from "@/lib/schemas/order";

const ENDPOINT = "https://api.callmebot.com/whatsapp.php";
const TIMEOUT_MS = 5000;

export const alertConfig = () => {
  const number = whatsappNumber(process.env.CALLMEBOT_PHONE);
  const apiKey = process.env.CALLMEBOT_APIKEY?.trim() || "";

  return number && apiKey ? { number, apiKey } : null;
};

export const orderAlertText = (order, base = siteUrl()) =>
  [
    `New order ${order.reference}`,
    ...order.items.map(
      (item) => `• ${item.name} (${item.size}) — ${formatPrice(item.unitCents)}`
    ),
    `Total: ${formatPrice(order.totals.totalCents)}`,
    `Payment: ${PAYMENT_METHOD_LABELS[order.payment.method] ?? order.payment.method}`,
    `City: ${order.shipping.city}`,
    `${base}/admin/orders/${order.reference}`,
  ].join("\n");

export const sendOrderAlert = async (
  order,
  { config = alertConfig(), fetchImpl = fetch } = {}
) => {
  if (!config) return { sent: false };

  const url = `${ENDPOINT}?${new URLSearchParams({
    phone: `+${config.number}`,
    text: orderAlertText(order),
    apikey: config.apiKey,
  })}`;

  try {
    const response = await fetchImpl(url, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) throw new Error(`CallMeBot answered ${response.status}`);

    return { sent: true };
  } catch (error) {
    console.error(
      `[order-alert] could not alert about ${order.reference}: ${errorMessage(error)}`
    );

    return { sent: false };
  }
};

export const alertStoreAboutOrder = (order) => {
  try {
    after(() => sendOrderAlert(order));
  } catch {
    void sendOrderAlert(order);
  }
};
