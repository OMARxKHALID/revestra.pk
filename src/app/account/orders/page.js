import Link from "next/link";
import InteriorPage from "@/components/interior-page";
import ClaimOrderForm from "@/components/claim-order-form";
import cn from "@/lib/utils/cn";
import { ITEM, META, TITLE } from "@/lib/type";
import { title } from "@/lib/brand";
import { formatPrice } from "@/lib/utils/price";
import { auth } from "@/auth";
import { listOrdersForUser } from "@/lib/api/orders";
import { isDatabaseConfigured } from "@/lib/db";
import { DEMO_ORDERS } from "@/lib/orders";

export const dynamic = "force-dynamic";

export const metadata = {
  title: title("Your orders"),
  robots: { index: false, follow: false },
};

const OrdersPage = async () => {
  const session = await auth();
  const stored = isDatabaseConfigured()
    ? await listOrdersForUser(session.user.id)
    : [];
  const orders = stored.length > 0 ? stored : DEMO_ORDERS;
  const demo = stored.length === 0;

  return (
    <InteriorPage heading="Your orders">
      {demo && (
        <p className={cn(META, "mt-4 text-sale")}>
          Sample data — no orders are attached to this account yet. Guest
          orders are added below, by reference and email.
        </p>
      )}

      <ul className="mt-10 divide-y divide-black/10 border-y border-black/10">
        {orders.map((order) => (
          <li
            key={order.reference}
            className="flex flex-wrap items-baseline justify-between gap-4 py-5"
          >
            <div>
              <p className={cn(TITLE, "text-black")}>
                {order.reference}
              </p>
              <p className={cn(META, "mt-1 text-black/45")}>
                {new Date(order.createdAt).toLocaleDateString("en-PK")} ·{" "}
                {order.items.length} item(s) · {order.status}
              </p>
            </div>

            <div className="flex items-baseline gap-6">
              <p className={cn(ITEM, "tabular-nums text-black")}>
                {formatPrice(order.totals.totalCents)}
              </p>

              {!demo && (
                <Link
                  href={`/orders/${order.reference}`}
                  className={cn(META, "text-blurple hover:underline")}
                >
                  View
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>

      <ClaimOrderForm />
    </InteriorPage>
  );
};

export default OrdersPage;
