"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useCart from "@/store/use-cart";
import cn from "@/lib/utils/cn";
import { META, NOTICE } from "@/lib/type";
import PillButton from "@/components/ui/pill-button";
import { isSold, sellableNow } from "@/lib/utils/stock";

const fetchStatus = async ({ queryKey }) => {
  const [, slug] = queryKey;
  const response = await fetch(`/api/products/${slug}/stock`);

  if (!response.ok) throw new Error("Could not load availability");

  return response.json();
};

const AddToCart = ({ product }) => {
  const addItem = useCart((state) => state.addItem);
  const items = useCart((state) => state.items);
  const [added, setAdded] = useState(false);
  const inCart = items.some((item) => item.slug === product.slug);

  const { data } = useQuery({
    queryKey: ["availability", product.slug],
    queryFn: fetchStatus,
    initialData: {
      status: product.status,
      reservedUntil: product.reservedUntil ?? null,
    },
    staleTime: 20_000,
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

      <p className={cn(META, "mt-4 text-black/45")}>
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
