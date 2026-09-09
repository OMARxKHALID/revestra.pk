"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import useCart, { selectSubtotal } from "@/store/use-cart";
import { isSold, sellableNow } from "@/lib/utils/stock";
import ConditionBadge from "@/components/ui/condition-badge";
import { formatPrice } from "@/lib/utils/price";
import cn from "@/lib/utils/cn";
import { ITEM, META, NOTICE, TITLE } from "@/lib/type";
import PillButton from "@/components/ui/pill-button";
import { TrashIcon } from "@/components/ui/icons";

const fetchCatalogue = async () => {
  const response = await fetch("/api/products");

  if (!response.ok) throw new Error("Could not load stock");

  return response.json();
};

const CartContents = () => {
  const items = useCart((state) => state.items);
  const removeItem = useCart((state) => state.removeItem);
  const clear = useCart((state) => state.clear);
  const subtotal = useCart(selectSubtotal);

  const { data } = useQuery({
    queryKey: ["catalogue-stock"],
    queryFn: fetchCatalogue,
    staleTime: 30_000,
  });

  const statusFor = (item) => {
    const product = data?.products?.find((entry) => entry.slug === item.slug);

    if (!product) return "gone";
    if (isSold(product)) return "sold";
    if (!sellableNow(product)) return "held";

    return "ok";
  };

  if (items.length === 0)
    return (
      <div className="border-t border-black/10 py-16 text-center">
        <p className={cn(TITLE, "text-black/70")}>
          Nothing in the cart yet.
        </p>
        <PillButton href="/products" className="mt-8">
          Browse the store
        </PillButton>
      </div>
    );

  return (
    <>
      <ul className="mt-10 border-t border-black/10">
        {items.map((item) => (
          <li
            key={item.slug}
            className="flex gap-5 border-b border-black/10 py-6 sm:gap-8"
          >
            <Link
              href={`/products/${item.slug}`}
              className="flex size-20 shrink-0 items-center justify-center bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blurple sm:size-28"
            >
              <Image
                src={item.image}
                alt={item.name}
                width={160}
                height={160}
                sizes="(max-width: 640px) 80px, 112px"
                className="h-[86%] w-auto object-contain"
              />
            </Link>

            <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Link
                  href={`/products/${item.slug}`}
                  className={cn(TITLE, "text-black transition hover:text-blurple focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blurple")}
                >
                  {item.name}
                </Link>

                <p className={cn(META, "mt-1 text-black/45")}>
                  {item.size}
                </p>

                {item.condition && (
                  <ConditionBadge condition={item.condition} className="mt-2" />
                )}

                {statusFor(item) !== "ok" && (
                  <p className={cn(NOTICE, "mt-2 text-sale")}>
                    {statusFor(item) === "sold"
                      ? "Sold while you were deciding — remove it to check out."
                      : "Someone else is checking out with this right now."}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-3 sm:gap-5">
                <p className={cn(ITEM, "min-w-16 text-right text-black")}>
                  {formatPrice(item.unitCents)}
                </p>

                <button
                  type="button"
                  onClick={() => removeItem(item.slug)}
                  className={cn(META, "relative flex items-center gap-1.5 text-black/45 transition before:absolute before:-inset-x-1 before:-inset-y-2 before:content-[''] hover:text-sale focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blurple")}
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col-reverse items-start gap-10 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <button
          type="button"
          onClick={clear}
          className={cn(META, "relative flex items-center gap-1.5 text-black/45 transition before:absolute before:-inset-x-1 before:-inset-y-2 before:content-[''] hover:text-sale focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blurple")}
        >
          <TrashIcon className="h-3.5 w-3.5" />
          Empty cart
        </button>

        <div className="w-full sm:w-auto sm:text-right">
          <p className={cn(TITLE, "flex items-baseline justify-between gap-10 text-black sm:justify-end")}>
            <span>Subtotal</span>
            <span className="tabular-nums">{formatPrice(subtotal)}</span>
          </p>
          <p className={cn(META, "mt-1 text-black/45")}>
            Shipping and tax calculated at checkout
          </p>

          <PillButton href="/checkout" className="mt-6 w-full sm:w-auto">
            Checkout
          </PillButton>
        </div>
      </div>
    </>
  );
};

export default CartContents;
