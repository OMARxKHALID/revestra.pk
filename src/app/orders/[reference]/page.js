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
import { verifyOrderToken } from "@/lib/utils/order-token";

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

      {order.payment.method !== "cod" && (
        <p className={cn(META, "mt-6 text-black/45")}>
          Paid by {order.payment.method} — {order.payment.status}
          {order.payment.verification === "unverified_postback" &&
            " (awaiting gateway confirmation)"}
        </p>
      )}

      {order.payment.method === "cod" && (
        <p className={cn(META, "mt-6 text-black/45")}>
          Cash on delivery — pay the courier on arrival.
        </p>
      )}

      <div className="mt-10 max-w-[460px]">
        <OrderSummary
          items={order.items}
          totals={order.totals}
          promo={order.promo}
        />
      </div>

      <div className="mt-10">
        <p className={cn(META, "text-black/70")}>Shipping to</p>
        <address className={cn(BODY, "mt-2 not-italic text-black/70")}>
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
