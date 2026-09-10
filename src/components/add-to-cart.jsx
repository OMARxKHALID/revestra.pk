"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useCart from "@/store/use-cart";
import cn from "@/lib/utils/cn";
import { META, NOTICE } from "@/lib/type";
import PillButton from "@/components/ui/pill-button";
import { isSold, sellableNow } from "@/lib/utils/stock";
import { request } from "@/lib/api-client";
import keys from "@/lib/query-keys";
import { track } from "@/lib/track";
import { ANALYTICS_EVENT, productProperties } from "@/lib/analytics";

const AddToCart = ({ product }) => {
  const addItem = useCart((state) => state.addItem);
  const items = useCart((state) => state.items);
  const [added, setAdded] = useState(false);
  const inCart = items.some((item) => item.slug === product.slug);

  const { data } = useQuery({
    queryKey: keys.products.availability(product.slug),
    queryFn: ({ signal }) =>
      request(`/api/products/${product.slug}/stock`, { signal }),
    initialData: {
      slug: product.slug,
      status: product.status,
      reservedUntil: product.reservedUntil ?? null,
    },
    initialDataUpdatedAt: 0,
    staleTime: 15_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  const live = { ...product, ...data };
  const sold = isSold(live);
  const takenBySomeoneElse = !sold && !sellableNow(live) && !inCart;

  useEffect(() => {
    if (!added) return;

    const timeout = setTimeout(() => setAdded(false), 2000);

    return () => clearTimeout(timeout);
  }, [added]);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    track(ANALYTICS_EVENT.productAdded, productProperties(product));
  };

  return (
    <div className="mt-8">
      <PillButton
        onClick={handleAdd}
        disabled={sold || takenBySomeoneElse || inCart}
      >
        {sold
          ? "Sold"
          : takenBySomeoneElse
            ? "In someone's cart"
            : inCart
              ? "In your cart"
              : added
                ? "Added"
                : "Add to Cart"}
      </PillButton>

      <p className={cn(META, "mt-4 text-ink-soft")}>
        {sold
          ? "This one has gone — every piece here is one of one."
          : "One of one. Once it sells, it is gone."}
      </p>

      <p
        aria-live="polite"
        className={cn(NOTICE, "mt-2", added ? "text-blurple" : "sr-only")}
      >
        {added ? "Added to your cart" : ""}
      </p>
    </div>
  );
};

export default AddToCart;
