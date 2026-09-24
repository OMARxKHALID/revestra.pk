"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import { WhatsappIcon } from "@hugeicons/core-free-icons";
import useCart from "@/store/use-cart";
import cn from "@/lib/utils/cn";
import { META, NOTICE } from "@/lib/type";
import PillButton from "@/components/ui/pill-button";
import { isSold, sellableNow } from "@/lib/utils/stock";
import { request } from "@/lib/api-client";
import keys from "@/lib/query-keys";
import { track } from "@/lib/track";
import { ANALYTICS_EVENT, productProperties } from "@/lib/analytics";
import { whatsappLink } from "@/lib/utils/whatsapp";

const AddToCart = ({ product, whatsapp }) => {
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
      <div className="flex flex-wrap justify-center gap-3">
        <PillButton
          onClick={handleAdd}
          disabled={sold || takenBySomeoneElse || inCart}
          className="min-w-[260px]"
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

        {whatsapp && !sold && (
          <PillButton
            href={whatsappLink(
              whatsapp,
              product,
              `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/products/${product.slug}`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-[260px] hover:border-whatsapp hover:bg-whatsapp focus-visible:outline-whatsapp"
          >
            <span className="inline-flex items-center justify-center gap-2">
              <HugeiconsIcon icon={WhatsappIcon} size={20} strokeWidth={1.8} />
              Buy on WhatsApp
            </span>
          </PillButton>
        )}
      </div>

      <p className={cn(META, "mt-4 text-ink-soft")}>
        {sold
          ? "This one has gone — every piece here is one of one."
          : "One of one. Once it sells, it is gone."}
      </p>

      <p
        aria-live="polite"
        className={cn(NOTICE, "mt-2", added ? "text-brand" : "sr-only")}
      >
        {added ? "Added to your cart" : ""}
      </p>
    </div>
  );
};

export default AddToCart;
