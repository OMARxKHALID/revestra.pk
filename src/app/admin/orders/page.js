import Link from "next/link";
import FilterBar from "@/components/admin/filter-bar";
import Pager from "@/components/admin/pager";
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
import { listOrders } from "@/lib/api/admin/orders";
import { listQuerySchema, ORDER_STATUSES } from "@/lib/schemas/admin";
import { formatPrice } from "@/lib/utils/price";

export const dynamic = "force-dynamic";

const STATUS_OPTIONS = ORDER_STATUSES.map((status) => ({
  value: status,
  label: status === "pending_payment" ? "Awaiting payment" : status,
}));

const OrdersPage = async ({ searchParams }) => {
  const query = listQuerySchema.parse(await searchParams);
  const { orders, total, page, perPage } = await listOrders(query);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders</CardTitle>
        <CardDescription>
          Search by reference, email, name or phone.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-5">
        <FilterBar
          placeholder="Reference, email, name"
          filters={[
            { key: "status", label: "Any status", options: STATUS_OPTIONS },
          ]}
        />

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead className="hidden md:table-cell">Placed</TableHead>
                <TableHead className="hidden sm:table-cell">Customer</TableHead>
                <TableHead className="hidden lg:table-cell">Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.reference}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/admin/orders/${order.reference}`}
                      className="hover:underline"
                    >
                      {order.reference}
                    </Link>
                  </TableCell>

                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("en-PK")}
                  </TableCell>

                  <TableCell className="hidden sm:table-cell">
                    <span className="block truncate max-w-[180px]">
                      {order.shipping?.name}
                    </span>
                    <span className="block truncate max-w-[180px] text-xs text-muted-foreground">
                      {order.email}
                    </span>
                  </TableCell>

                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {order.payment.method} · {order.payment.status}
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>

                  <TableCell className="text-right tabular-nums">
                    {formatPrice(order.totals.totalCents)}
                  </TableCell>
                </TableRow>
              ))}

              {orders.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-muted-foreground"
                  >
                    No orders match that.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Pager page={page} perPage={perPage} total={total} />
      </CardContent>
    </Card>
  );
};

export default OrdersPage;
