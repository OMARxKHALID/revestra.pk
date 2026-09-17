import Link from "next/link";
import { UserGroupIcon } from "@hugeicons/core-free-icons";
import PageLayout from "@/components/admin/page-layout";
import PageHeader from "@/components/admin/page-header";
import FilterBar from "@/components/admin/filter-bar";
import Pager from "@/components/admin/pager";
import RoleToggle from "@/components/admin/role-toggle";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { auth } from "@/auth";
import { listCustomers } from "@/lib/api/admin/customers";
import { listQuerySchema } from "@/lib/schemas/admin";
import { ROLE } from "@/lib/roles";
import { formatPrice } from "@/lib/utils/price";

export const dynamic = "force-dynamic";

const day = (value) =>
  value ? new Date(value).toLocaleDateString("en-PK") : "—";

const CustomersPage = async ({ searchParams }) => {
  const query = listQuerySchema.parse(await searchParams);
  const [session, { customers, total, page, perPage }] = await Promise.all([
    auth(),
    listCustomers(query),
  ]);

  return (
    <PageLayout>
      <PageHeader
        title="Customers"
        description={`${total} accounts. Orders and spend count delivered, shipped, processing and received orders.`}
        icon={UserGroupIcon}
      />

      <Card>
        <CardContent className="grid gap-5">
          <FilterBar placeholder="Name or email" />

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Joined</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="hidden sm:table-cell text-right">Spent</TableHead>
                  <TableHead className="hidden lg:table-cell">Last order</TableHead>
                  <TableHead className="text-right">Role</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <span className="block max-w-[220px] truncate font-medium">
                        {customer.name}
                      </span>
                      <Link
                        href={`/admin/orders?q=${encodeURIComponent(customer.email)}`}
                        className="block max-w-[220px] truncate text-xs text-muted-foreground hover:underline"
                      >
                        {customer.email}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {day(customer.createdAt)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {customer.orders}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-right tabular-nums">
                      {formatPrice(customer.spentCents)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {day(customer.lastOrderAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-3">
                        {customer.role === ROLE.admin && (
                          <Badge variant="info">Admin</Badge>
                        )}
                        <RoleToggle
                          id={customer.id}
                          name={customer.name}
                          role={customer.role}
                          self={customer.id === session?.user?.id}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {customers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-12 text-center text-muted-foreground"
                    >
                      No accounts match that.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <Pager page={page} perPage={perPage} total={total} />
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default CustomersPage;
