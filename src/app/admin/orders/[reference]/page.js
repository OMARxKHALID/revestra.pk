import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag03Icon } from "@hugeicons/core-free-icons";
import PageLayout from "@/components/admin/page-layout";
import PageHeader from "@/components/admin/page-header";
import StatusBadge from "@/components/admin/status-badge";
import OrderStatusForm from "@/components/admin/order-status-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getOrder } from "@/lib/api/admin/orders";
import { getSettings } from "@/lib/api/settings";
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/schemas/order";
import { formatPrice } from "@/lib/utils/price";

export const dynamic = "force-dynamic";

const Row = ({ label, children }) => (
  <div className="flex items-baseline justify-between gap-6 py-2 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-right tabular-nums">{children}</span>
  </div>
);

const OrderDetailPage = async ({ params }) => {
  const { reference } = await params;
  const [order, settings] = await Promise.all([
    getOrder(reference),
    getSettings(),
  ]);

  if (!order) notFound();

  return (
    <PageLayout>
      <PageHeader
        title={order.reference}
        description={`Placed ${new Date(order.createdAt).toLocaleString("en-PK")}`}
        icon={ShoppingBag03Icon}
      >
        <StatusBadge status={order.status} />
      </PageHeader>

      {order.stockConflict?.length > 0 && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          These items could not be marked sold and need reconciling by hand:{" "}
          {order.stockConflict.join(", ")}.
        </div>
      )}

      <div className="ph-no-capture grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="grid gap-6">
          <Card>
            <CardContent className="grid gap-4 pt-6">
              {order.items.map((item) => (
                <div key={item.slug} className="flex items-center gap-4">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="56px"
                      className="object-contain p-1"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/products/${item.slug}`}
                      className="block truncate text-sm font-medium hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.sku} · {item.size} · {item.condition}
                    </p>
                  </div>

                  <p className="tabular-nums text-sm">
                    {formatPrice(item.unitCents)}
                  </p>
                </div>
              ))}

              <Separator />

              <div className="grid">
                <Row label="Subtotal">{formatPrice(order.totals.subtotalCents)}</Row>
                {order.totals.discountCents > 0 && (
                  <Row label={`Discount ${order.promo?.code ?? ""}`}>
                    −{formatPrice(order.totals.discountCents)}
                  </Row>
                )}
                <Row label="Shipping">
                  {order.totals.shippingCents === 0
                    ? "Free"
                    : formatPrice(order.totals.shippingCents)}
                </Row>
                <Separator className="my-2" />
                <Row label="Total">
                  <span className="font-medium">
                    {formatPrice(order.totals.totalCents)}
                  </span>
                </Row>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>History</CardTitle>
            </CardHeader>

            <CardContent className="grid gap-3">
              {(order.history ?? []).map((entry, index) => (
                <div
                  key={`${entry.status}-${index}`}
                  className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-3 text-sm last:border-0 last:pb-0"
                >
                  <span className="capitalize">{entry.status}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.at).toLocaleString("en-PK")}
                    {entry.note ? ` · ${entry.note}` : ""}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 content-start">
          <Card>
            <CardHeader>
              <CardTitle>Update</CardTitle>
            </CardHeader>

            <CardContent>
              <OrderStatusForm
                reference={order.reference}
                status={order.status}
                tracking={order.tracking}
                couriers={settings.couriers}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>

            <CardContent className="grid gap-1 text-sm">
              <p>{order.shipping.name}</p>
              <p className="break-all text-muted-foreground">{order.email}</p>
              <p className="text-muted-foreground">{order.shipping.phone}</p>

              <Separator className="my-3" />

              <address className="not-italic text-muted-foreground">
                {order.shipping.address}
                {order.shipping.apartment ? `, ${order.shipping.apartment}` : ""}
                <br />
                {order.shipping.city} {order.shipping.postalCode}
                <br />
                {order.shipping.country}
              </address>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>

            <CardContent className="grid gap-1 text-sm">
              <Row label="Method">
                {PAYMENT_METHOD_LABELS[order.payment.method] ?? order.payment.method}
              </Row>
              <Row label="Status">
                {PAYMENT_STATUS_LABELS[order.payment.status] ?? order.payment.status}
              </Row>
              <Row label="Verification">{order.payment.verification}</Row>
              {order.payment.providerTxnId && (
                <Row label="Gateway ref">{order.payment.providerTxnId}</Row>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default OrderDetailPage;
