import Link from "next/link";
import { Analytics01Icon } from "@hugeicons/core-free-icons";
import PageLayout from "@/components/admin/page-layout";
import PageHeader from "@/components/admin/page-header";
import { KpiCard, KpiCardsGrid } from "@/components/admin/kpi-card";
import RevenueChart from "@/components/admin/revenue-chart";
import StatusBadge from "@/components/admin/status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMetrics } from "@/lib/api/admin/metrics";
import { formatPrice } from "@/lib/utils/price";

export const dynamic = "force-dynamic";

const OverviewPage = async () => {
  const metrics = await getMetrics();

  if (!metrics.configured)
    return (
      <PageLayout>
        <PageHeader
          title="Overview"
          description="Trading at a glance."
          icon={Analytics01Icon}
        />

        <Card>
          <CardHeader>
            <CardTitle>No database configured</CardTitle>
            <CardDescription>
              Set MONGODB_URI in .env.local, run bun run seed, then reload.
            </CardDescription>
          </CardHeader>
        </Card>
      </PageLayout>
    );

  return (
    <PageLayout>
      <PageHeader
        title="Overview"
        description="Revenue, stock and anything waiting on you."
        icon={Analytics01Icon}
      />

      <KpiCardsGrid>
        <KpiCard
          title="Revenue, 30 days"
          value={formatPrice(metrics.windowRevenueCents)}
          period={`${metrics.windowOrders} settled orders`}
        />
        <KpiCard
          title="Revenue, lifetime"
          value={formatPrice(metrics.revenueCents)}
          period={`Average ${formatPrice(metrics.averageOrderCents)} per order`}
        />
        <KpiCard
          title="Stock on hand"
          value={metrics.inventory.available}
          period={`${metrics.inventory.reserved} on hold · ${metrics.inventory.sold} sold`}
        />
        <KpiCard
          title="Stock at cost"
          value={formatPrice(metrics.inventoryCostCents)}
          period={`${formatPrice(metrics.inventoryRetailCents)} at retail`}
        />
      </KpiCardsGrid>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
        <RevenueChart series={metrics.series} />

        <Card>
          <CardHeader>
            <CardTitle>Needs attention</CardTitle>
            <CardDescription>Things waiting on you</CardDescription>
          </CardHeader>

          <CardContent className="grid gap-3 text-sm">
            <Link
              href="/admin/orders?status=pending_payment"
              className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 transition hover:bg-muted"
            >
              <span>Orders awaiting payment</span>
              <span className="font-medium tabular-nums">
                {metrics.awaitingPayment}
              </span>
            </Link>

            <Link
              href="/admin/reviews?status=hidden"
              className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 transition hover:bg-muted"
            >
              <span>Hidden reviews</span>
              <span className="font-medium tabular-nums">
                {metrics.hiddenReviews}
              </span>
            </Link>

            <Link
              href="/admin/subscribers"
              className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 transition hover:bg-muted"
            >
              <span>Newsletter subscribers</span>
              <span className="font-medium tabular-nums">
                {metrics.subscribers}
              </span>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest orders</CardTitle>
          <CardDescription>
            The six most recent, whatever the status
          </CardDescription>
        </CardHeader>

        <CardContent className="px-0 sm:px-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Customer
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {metrics.recent.map((order) => (
                  <TableRow key={order.reference}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/admin/orders/${order.reference}`}
                        className="hover:underline"
                      >
                        {order.reference}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {order.shipping?.name ?? "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatPrice(order.totals.totalCents)}
                    </TableCell>
                  </TableRow>
                ))}

                {metrics.recent.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-10 text-center text-muted-foreground"
                    >
                      No orders yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default OverviewPage;
