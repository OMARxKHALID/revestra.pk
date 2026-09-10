"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import useCart, { selectSubtotal } from "@/store/use-cart";
import { isSold, sellableNow } from "@/lib/utils/stock";
import ConditionBadge from "@/components/condition-badge";
import { formatPrice } from "@/lib/utils/price";
import cn from "@/lib/utils/cn";
import { ITEM, META, NOTICE, TITLE } from "@/lib/type";
import PillButton from "@/components/ui/pill-button";
import { TrashIcon } from "@/components/ui/icons";
import ErrorState from "@/components/ui/error-state";
import { request } from "@/lib/api-client";
import keys from "@/lib/query-keys";
import { track } from "@/lib/track";
import { ANALYTICS_EVENT, productProperties } from "@/lib/analytics";

const fetchStock = ({ queryKey, signal }) => {
  const [, slugs] = queryKey;
  const params = new URLSearchParams();

  for (const slug of slugs) params.append("slug", slug);

  return request(`/api/stock?${params}`, { signal });
};

const WARNINGS = {
  gone: "No longer listed — remove it to check out.",
  sold: "Sold while you were deciding — remove it to check out.",
  held: "Someone else is checking out with this right now.",
};

const CartContents = () => {
  const items = useCart((state) => state.items);
  const removeItem = useCart((state) => state.removeItem);
  const clear = useCart((state) => state.clear);
  const subtotal = useCart(selectSubtotal);
  const slugs = items.map((item) => item.slug);

  const viewed = useRef(false);

  useEffect(() => {
    if (viewed.current) return;

    viewed.current = true;
    track(ANALYTICS_EVENT.cartViewed, {
      products: items.map(productProperties),
    });
  }, [items]);

  const handleRemove = (item) => {
    removeItem(item.slug);
    track(ANALYTICS_EVENT.productRemoved, productProperties(item));
  };

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: keys.stock.forSlugs(slugs),
    queryFn: fetchStock,
    enabled: slugs.length > 0,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
  });

  const statuses = new Map(
    (data?.stock ?? []).map((entry) => [entry.slug, entry])
  );

  const statusFor = (slug) => {
    if (isPending || isError) return null;

    const live = statuses.get(slug);

    if (!live || live.status === "gone") return "gone";
    if (isSold(live)) return "sold";
    if (!sellableNow(live)) return "held";

    return null;
  };

  if (isError)
    return (
      <ErrorState
        error={error}
        eyebrow="Could not check stock"
        actions={
          <>
            <PillButton onClick={() => refetch()}>Try again</PillButton>
            <PillButton href="/products">Keep shopping</PillButton>
          </>
        }
      />
    );

  if (items.length === 0)
    return (
      <div className="border-t border-rule py-16 text-center">
        <p className={cn(TITLE, "text-ink-muted")}>Nothing in the cart yet.</p>
        <PillButton href="/products" className="mt-8">
          Browse the store
        </PillButton>
      </div>
    );

  return (
    <>
      <ul className="mt-10 border-t border-rule">
        {items.map((item) => {
          const warning = statusFor(item.slug);

          return (
            <li
              key={item.slug}
              className="flex gap-5 border-b border-rule py-6 sm:gap-8"
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
                    className={cn(
                      TITLE,
                      "text-ink transition hover:text-blurple focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blurple"
                    )}
                  >
                    {item.name}
                  </Link>

                  <p className={cn(META, "mt-1 text-ink-soft")}>{item.size}</p>

                  {item.condition && (
                    <ConditionBadge condition={item.condition} className="mt-2" />
                  )}

                  {isPending && (
                    <p className={cn(NOTICE, "mt-2 text-ink-soft")}>
                      Checking availability…
                    </p>
                  )}

                  {warning && (
                    <p className={cn(NOTICE, "mt-2 text-sale")}>
                      {WARNINGS[warning]}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-3 sm:gap-5">
                  <p className={cn(ITEM, "min-w-16 text-right text-ink")}>
                    {formatPrice(item.unitCents)}
                  </p>

                  <button
                    type="button"
                    onClick={() => handleRemove(item)}
                    className={cn(
                      META,
                      "relative flex items-center gap-1.5 text-ink-soft transition before:absolute before:-inset-x-1 before:-inset-y-2 before:content-[''] hover:text-sale focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blurple"
                    )}
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 flex flex-col-reverse items-start gap-10 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <button
          type="button"
          onClick={clear}
          className={cn(
            META,
            "relative flex items-center gap-1.5 text-ink-soft transition before:absolute before:-inset-x-1 before:-inset-y-2 before:content-[''] hover:text-sale focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blurple"
          )}
        >
          <TrashIcon className="h-3.5 w-3.5" />
          Empty cart
        </button>

        <div className="w-full sm:w-auto sm:text-right">
          <p
            className={cn(
              TITLE,
              "flex items-baseline justify-between gap-10 text-ink sm:justify-end"
            )}
          >
            <span>Subtotal</span>
            <span className="tabular-nums">{formatPrice(subtotal)}</span>
          </p>
          <p className={cn(META, "mt-1 text-ink-soft")}>
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
