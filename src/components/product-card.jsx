"use client";

import Image from "next/image";
import Link from "next/link";
import useInView from "@/hooks/use-in-view";
import cn from "@/lib/utils/cn";
import { formatPrice } from "@/lib/utils/price";
import { isSold, isReserved } from "@/lib/utils/stock";
import ConditionBadge from "@/components/ui/condition-badge";
import { ITEM, META } from "@/lib/type";

const REVEAL_DELAYS = [
  "motion-safe:[animation-delay:0ms]",
  "motion-safe:[animation-delay:80ms]",
  "motion-safe:[animation-delay:160ms]",
];

const ProductCard = ({
  slug,
  name,
  brand,
  sizeLabel,
  condition,
  priceCents,
  salePriceCents,
  image,
  status,
  index = 0,
}) => {
  const [ref, state] = useInView({ threshold: 0.15 });
  const sold = isSold({ status });
  const held = isReserved({ status });

  return (
    <Link
      href={`/products/${slug}`}
      ref={ref}
      className={cn(
        "group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blurple",
        state === "hidden" && "opacity-0",
        state === "revealed" && [
          "motion-safe:animate-fade-up",
          REVEAL_DELAYS[index % REVEAL_DELAYS.length],
        ]
      )}
    >
      <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-white">
        {(sold || held) && (
          <span
            className={cn(
              META,
              "absolute left-0 top-0 z-10 px-2.5 py-1.5 text-white",
              sold ? "bg-black" : "bg-blurple"
            )}
          >
            {sold ? "Sold" : "On hold"}
          </span>
        )}

        <Image
          src={image}
          alt={name}
          width={480}
          height={480}
          sizes="(max-width: 640px) 88vw, (max-width: 1024px) 44vw, 360px"
          className={cn(
            "h-[82%] w-auto object-contain transition-transform duration-500 ease-out group-hover:-translate-y-1.5",
            sold && "opacity-45"
          )}
        />
      </div>

      <p className={cn(META, "mt-5 text-black/45")}>
        {brand} · {sizeLabel}
      </p>

      <h3 className={cn(ITEM, "mt-1.5 text-black")}>{name}</h3>

      <p className={cn(ITEM, "mt-1.5 flex items-center gap-2")}>
        {salePriceCents === null ? (
          <span className="text-black">{formatPrice(priceCents)}</span>
        ) : (
          <>
            <span className="text-sale line-through decoration-1">
              {formatPrice(priceCents)}
            </span>
            <span className="text-black">{formatPrice(salePriceCents)}</span>
          </>
        )}
      </p>

      <ConditionBadge condition={condition} className="mt-3" />
    </Link>
  );
};

export default ProductCard;
