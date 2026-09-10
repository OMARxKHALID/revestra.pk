import "server-only";
import { captureServerException } from "@/lib/api/analytics";

const reportPaymentAnomaly = async (provider, problem, order, result) => {
  const message = `[${provider}] ${problem} on ${order.reference} — leaving it pending for manual reconciliation`;

  console.error(message);

  await captureServerException(new Error(message), {
    distinctId: order.distinctId || order.userId || null,
    area: "payments",
    provider,
    problem,
    reference: order.reference,
    gateway_amount_cents: result?.amountCents ?? null,
    order_amount_cents: order.payment?.amountCents ?? null,
    gateway_code: result?.code ?? null,
  });
};

export default reportPaymentAnomaly;
