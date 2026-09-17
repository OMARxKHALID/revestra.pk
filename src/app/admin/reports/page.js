import Link from "next/link";
import { ChartHistogramIcon } from "@hugeicons/core-free-icons";
import PageLayout from "@/components/admin/page-layout";
import PageHeader from "@/components/admin/page-header";
import { KpiCard, KpiCardsGrid } from "@/components/admin/kpi-card";
import { Button } from "@/components/ui/button";
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
import { getSalesReport } from "@/lib/api/admin/reports";
import { formatPrice } from "@/lib/utils/price";

export const dynamic = "force-dynamic";

const RANGES = [
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
  { days: 365, label: "12 months" },
  { days: 0, label: "All time" },
];

const monthName = (month) =>
  new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-PK", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

const Breakdown = ({ title, description, rows }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>

    <CardContent className="px-0 sm:px-6">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Sold</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="hidden sm:table-cell text-right">Margin</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.name}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell className="text-right tabular-nums">{row.itemsSold}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatPrice(row.revenueCents)}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-right tabular-nums">
                  {formatPrice(row.marginCents)}
                </TableCell>
              </TableRow>
            ))}

            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  Nothing sold in this range yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
);

const ReportsPage = async ({ searchParams }) => {
  const { days } = await searchParams;
  const range =
    RANGES.find((option) => String(option.days) === String(days)) ?? RANGES[0];
  const report = await getSalesReport({ days: range.days });

  return (
    <PageLayout>
      <PageHeader
        title="Reports"
        description="Delivered, shipped, processing and received orders count as sales. Margin needs a cost on the piece."
        icon={ChartHistogramIcon}
      />

      <div className="flex flex-wrap gap-2">
        {RANGES.map((option) => (
          <Button
            key={option.days}
            size="sm"
            variant={option.days === range.days ? "default" : "outline"}
            render={<Link href={`/admin/reports?days=${option.days}`} />}
          >
            {option.label}
          </Button>
        ))}
      </div>

      <KpiCardsGrid>
        <KpiCard title={`Revenue, ${range.label.toLowerCase()}`} value={formatPrice(report.revenueCents)} />
        <KpiCard title="Orders" value={report.orders} />
        <KpiCard title="Average order" value={formatPrice(report.averageOrderCents)} />
        <KpiCard title="Pieces sold" value={report.itemsSold} />
        <KpiCard
          title="Margin"
          value={`${formatPrice(report.marginCents)} · ${report.marginPercent}%`}
        />
        <KpiCard title="Discounts given" value={formatPrice(report.discountCents)} />
        <KpiCard title="Shipping collected" value={formatPrice(report.shippingCents)} />
        <KpiCard title="Stock cost sold" value={formatPrice(report.costCents)} />
      </KpiCardsGrid>

      {report.itemsWithoutCost > 0 && (
        <p className="text-sm text-muted-foreground">
          {report.itemsWithoutCost} sold{" "}
          {report.itemsWithoutCost === 1 ? "piece has" : "pieces have"} no cost
          recorded, so the margin above is understated.
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>By month</CardTitle>
          <CardDescription>Revenue and orders per calendar month.</CardDescription>
        </CardHeader>

        <CardContent className="px-0 sm:px-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {report.months.map((month) => (
                  <TableRow key={month.month}>
                    <TableCell className="font-medium">{monthName(month.month)}</TableCell>
                    <TableCell className="text-right tabular-nums">{month.orders}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatPrice(month.revenueCents)}
                    </TableCell>
                  </TableRow>
                ))}

                {report.months.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                      No sales in this range yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Breakdown
          title="By category"
          description="Which rails earn their space."
          rows={report.categories}
        />
        <Breakdown
          title="By brand"
          description="Best brands by revenue."
          rows={report.brands}
        />
      </div>
    </PageLayout>
  );
};

export default ReportsPage;
