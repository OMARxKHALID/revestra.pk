import Link from "next/link";
import { notFound } from "next/navigation";
import InteriorPage from "@/components/interior-page";
import OrderSummary from "@/components/order-summary";
import OrderStatus from "@/components/order-status";
import PillButton from "@/components/ui/pill-button";
import cn from "@/lib/utils/cn";
import { BODY, META } from "@/lib/type";
import { title } from "@/lib/brand";
import { optionalSession } from "@/lib/session";
import { findOrderByReference, orderSecret } from "@/lib/api/orders";
import { PAYMENT_METHOD, PAYMENT_STATUS } from "@/lib/schemas/order";
import { verifyOrderToken } from "@/lib/utils/order-token";
import CancelOrderButton from "@/components/cancel-order-button";
import { CANCELLABLE_STATUSES } from "@/lib/api/orders";

export const dynamic = "force-dynamic";

export const metadata = {
  title: title("Order"),
  robots: { index: false, follow: false },
};

const OrderPage = async ({ params, searchParams }) => {
  const { reference } = await params;
  const { t } = await searchParams;

  const order = await findOrderByReference(reference);

  if (!order) notFound();

  const session = await optionalSession();
  const claim = verifyOrderToken(t, orderSecret());
  const owns = session?.user?.id && order.userId === session.user.id;

  if (!owns && claim?.reference !== reference) notFound();

  return (
    <InteriorPage heading={`Order ${order.reference}`}>
      <OrderStatus status={order.status} />

      {order.payment.method !== PAYMENT_METHOD.cod && (
        <p className={cn(META, "mt-6 text-ink-soft")}>
          Paid by {order.payment.method} — {order.payment.status}
          {order.payment.verification === "unverified_postback" &&
            " (awaiting gateway confirmation)"}
        </p>
      )}

      {order.payment.method === PAYMENT_METHOD.cod && (
        <p className={cn(META, "mt-6 text-ink-soft")}>
          Cash on delivery — pay the courier on arrival.
        </p>
      )}

      {order.tracking?.number || order.tracking?.courier ? (
        <p className={cn(META, "mt-4 text-ink-soft")}>
          {[
            order.tracking.courier && `Courier: ${order.tracking.courier}`,
            order.tracking.number && `Tracking: ${order.tracking.number}`,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      ) : null}

      <p className={cn(META, "mt-6")}>
        <Link
          href={`/orders/${order.reference}/invoice?t=${encodeURIComponent(t ?? "")}`}
          className="text-blurple hover:underline"
        >
          View invoice
        </Link>
      </p>

      {CANCELLABLE_STATUSES.includes(order.status) &&
        order.payment.status !== PAYMENT_STATUS.paid && (
          <CancelOrderButton reference={order.reference} token={t ?? ""} />
        )}

      <div className="mt-10 max-w-[460px]">
        <OrderSummary
          items={order.items}
          totals={order.totals}
          promo={order.promo}
        />
      </div>

      <div className="mt-10">
        <p className={cn(META, "text-ink-muted")}>Shipping to</p>
        <address className={cn(BODY, "mt-2 not-italic text-ink-muted")}>
          {order.shipping.name}
          <br />
          {order.shipping.address}
          {order.shipping.apartment ? `, ${order.shipping.apartment}` : ""}
          <br />
          {order.shipping.city} {order.shipping.postalCode}
          <br />
          {order.shipping.country}
        </address>
      </div>

      <PillButton href="/products" className="mt-12">
        Keep shopping
      </PillButton>
    </InteriorPage>
  );
};

export default OrderPage;
