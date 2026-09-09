import { notFound } from "next/navigation";
import InteriorPage from "@/components/interior-page";
import PillButton from "@/components/ui/pill-button";
import PaymentRedirectForm from "@/components/payment-redirect-form";
import cn from "@/lib/utils/cn";
import { META } from "@/lib/type";
import { title } from "@/lib/brand";
import { formatPrice } from "@/lib/utils/price";
import {
  findOrderByReference,
  orderSecret,
  recordAttempt,
} from "@/lib/api/orders";
import { verifyOrderToken } from "@/lib/utils/order-token";
import { getAdapter, modeFor } from "@/lib/payments";

const MAX_PAYMENT_ATTEMPTS = 10;

export const dynamic = "force-dynamic";

export const metadata = {
  title: title("Payment"),
  robots: { index: false, follow: false },
};

const PayPage = async ({ params, searchParams }) => {
  const { reference } = await params;
  const { t } = await searchParams;

  const claim = verifyOrderToken(t, orderSecret());

  if (!claim || claim.reference !== reference) notFound();

  const order = await findOrderByReference(reference);

  if (!order) notFound();

  if (order.payment.status !== "pending")
    return (
      <InteriorPage
        centered
        eyebrow="Nothing to pay"
        heading="This order is already settled"
        className="max-w-[560px]"
      >
        <PillButton href={`/orders/${reference}?t=${t}`} className="mt-10">
          View the order
        </PillButton>
      </InteriorPage>
    );

  const adapter = getAdapter(order.payment.method);

  if (!adapter || !adapter.isConfigured())
    return (
      <InteriorPage
        centered
        eyebrow="Unavailable"
        eyebrowTone="text-sale"
        heading="That payment method is not set up"
        intro={`Nothing was charged. Your order is held under ${reference} — choose cash on delivery, or try again once the gateway is configured.`}
        className="max-w-[560px]"
      >
        <PillButton href="/checkout" className="mt-10">
          Back to checkout
        </PillButton>
      </InteriorPage>
    );

  const attempt = (order.payment.attempts?.length ?? 0) + 1;

  if (attempt > MAX_PAYMENT_ATTEMPTS)
    return (
      <InteriorPage
        centered
        eyebrow="Too many attempts"
        eyebrowTone="text-sale"
        heading="We cannot retry this payment again"
        intro={`Nothing was charged. Your order is held under ${reference} — start a new order, or choose cash on delivery.`}
        className="max-w-[560px]"
      >
        <PillButton href="/products" className="mt-10">
          Back to the shop
        </PillButton>
      </InteriorPage>
    );
  const session = adapter.createSession({
    order,
    mode: order.payment.mode ?? modeFor(order.payment.method),
    attempt,
  });

  await recordAttempt(reference, {
    ref: session.attemptRef,
    at: new Date(),
    status: "started",
    code: null,
    message: `Attempt ${attempt} via ${adapter.label}`,
  });

  return (
    <InteriorPage
      centered
      eyebrow={`Order ${reference}`}
      heading={`${formatPrice(order.payment.amountCents)} to pay`}
      className="max-w-[560px]"
    >
      <p className={cn(META, "mt-4 text-black/45")}>
        Your card or wallet details are entered on {adapter.label}, never here.
      </p>

      <div className="mt-10">
        <PaymentRedirectForm
          action={session.action}
          fields={session.fields}
          label={adapter.label}
        />
      </div>
    </InteriorPage>
  );
};

export default PayPage;
