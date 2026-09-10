import Link from "next/link";
import InteriorPage from "@/components/interior-page";
import ClaimOrderForm from "@/components/claim-order-form";
import cn from "@/lib/utils/cn";
import { ITEM, META, TITLE } from "@/lib/type";
import { title } from "@/lib/brand";
import { formatPrice } from "@/lib/utils/price";
import { redirect } from "next/navigation";
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

  if (!session?.user) redirect("/sign-in?callbackUrl=/account/orders");

  const configured = isDatabaseConfigured();
  const stored = configured ? await listOrdersForUser(session.user.id) : [];
  const demo = !configured && stored.length === 0;
  const orders = demo ? DEMO_ORDERS : stored;

  return (
    <InteriorPage heading="Your orders">
      {demo && (
        <p className={cn(META, "mt-4 text-sale")}>
          Sample data — no orders are attached to this account yet. Guest
          orders are added below, by reference and email.
        </p>
      )}

      <ul className="mt-10 divide-y divide-rule border-y border-rule">
        {orders.map((order) => (
          <li
            key={order.reference}
            className="flex flex-wrap items-baseline justify-between gap-4 py-5"
          >
            <div>
              <p className={cn(TITLE, "text-ink")}>
                {order.reference}
              </p>
              <p className={cn(META, "mt-1 text-ink-soft")}>
                {new Date(order.createdAt).toLocaleDateString("en-PK")} ·{" "}
                {order.items.length} item(s) · {order.status}
              </p>
            </div>

            <div className="flex items-baseline gap-6">
              <p className={cn(ITEM, "tabular-nums text-ink")}>
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
