import { notFound } from "next/navigation";
import { findOrderByReference, orderSecret } from "@/lib/api/orders";
import { verifyOrderToken } from "@/lib/utils/order-token";
import { optionalSession } from "@/lib/session";
import { getSettings } from "@/lib/api/settings";
import { formatPrice } from "@/lib/utils/price";
import { title } from "@/lib/brand";
import PrintButton from "@/components/print-button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: title("Invoice"),
  robots: { index: false, follow: false },
};

const Row = ({ label, value, strong = false }) => (
  <div className="flex justify-between gap-6 py-1">
    <span className={strong ? "font-semibold" : undefined}>{label}</span>
    <span className={strong ? "font-semibold tabular-nums" : "tabular-nums"}>
      {value}
    </span>
  </div>
);

const InvoicePage = async ({ params, searchParams }) => {
  const { reference } = await params;
  const { t } = await searchParams;

  const [order, settings, session] = await Promise.all([
    findOrderByReference(reference),
    getSettings(),
    optionalSession(),
  ]);

  if (!order) notFound();

  const owns = Boolean(order.userId) && order.userId === session?.user?.id;
  const claim = verifyOrderToken(t, orderSecret());

  if (!owns && claim?.reference !== reference) notFound();

  const placed = new Date(order.createdAt).toLocaleDateString("en-PK");

  return (
    <main className="mx-auto max-w-[720px] bg-white px-6 py-12 text-sm text-black">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold">Invoice</h1>
          <p className="mt-1 text-black/60">
            {order.reference} · {placed}
          </p>
        </div>

        <div className="text-right text-black/60">
          <p className="font-semibold text-black">{settings.legalName}</p>
          {settings.addressLine && <p>{settings.addressLine}</p>}
          <p>{settings.city}</p>
          <p>{settings.email}</p>
          {settings.phone && <p>{settings.phone}</p>}
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-black/50">
          Billed to
        </h2>

        <p className="mt-2">{order.shipping.name}</p>
        <p className="text-black/70">{order.shipping.address}</p>
        {order.shipping.apartment && (
          <p className="text-black/70">{order.shipping.apartment}</p>
        )}
        <p className="text-black/70">
          {order.shipping.city} {order.shipping.postalCode}
        </p>
        <p className="text-black/70">{order.shipping.country}</p>
        <p className="mt-2 text-black/70">{order.email}</p>
        <p className="text-black/70">{order.shipping.phone}</p>
      </section>

      <table className="mt-10 w-full border-collapse">
        <thead>
          <tr className="border-b border-black/20 text-left">
            <th className="py-2 font-semibold">Item</th>
            <th className="py-2 text-right font-semibold">Price</th>
          </tr>
        </thead>

        <tbody>
          {order.items.map((item) => (
            <tr key={item.slug} className="border-b border-black/10">
              <td className="py-2">
                {item.name}
                <span className="block text-black/60">
                  {[item.size, item.condition].filter(Boolean).join(" · ")}
                </span>
              </td>
              <td className="py-2 text-right tabular-nums">
                {formatPrice(item.unitCents)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="mt-6 ml-auto max-w-[320px]">
        <Row label="Subtotal" value={formatPrice(order.totals.subtotalCents)} />

        {order.totals.discountCents > 0 && (
          <Row
            label={`Discount${order.promo ? ` (${order.promo.code})` : ""}`}
            value={`−${formatPrice(order.totals.discountCents)}`}
          />
        )}

        <Row
          label="Shipping"
          value={
            order.totals.shippingCents === 0
              ? "Free"
              : formatPrice(order.totals.shippingCents)
          }
        />

        {order.totals.taxCents > 0 && (
          <Row label="Tax" value={formatPrice(order.totals.taxCents)} />
        )}

        <div className="mt-2 border-t border-black/20 pt-2">
          <Row
            label="Total"
            value={formatPrice(order.totals.totalCents)}
            strong
          />
        </div>
      </section>

      <p className="mt-10 text-black/60">
        Paid by {order.payment.method} · {order.payment.status}. Order status:{" "}
        {order.status}.
      </p>

      <PrintButton />
    </main>
  );
};

export default InvoicePage;
