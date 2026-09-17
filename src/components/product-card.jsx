import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/motion/reveal";
import cn from "@/lib/utils/cn";
import { formatPrice } from "@/lib/utils/price";
import { isSold, isReserved } from "@/lib/utils/stock";
import ConditionBadge from "@/components/condition-badge";
import { ITEM, META } from "@/lib/type";

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
  const sold = isSold({ status });
  const held = isReserved({ status });

  return (
    <Reveal index={index}>
      <Link
        href={`/products/${slug}`}
        className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blurple"
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
            loading={index < 3 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"}
            className={cn(
              "h-[82%] w-auto object-contain transition-transform duration-500 ease-out group-hover:-translate-y-1.5",
              sold && "opacity-45"
            )}
          />
        </div>

        <p className={cn(META, "mt-5 text-ink-soft")}>
          {brand} · {sizeLabel}
        </p>

        <h3 className={cn(ITEM, "mt-1.5 text-ink")}>{name}</h3>

        <p className={cn(ITEM, "mt-1.5 flex items-center gap-2")}>
          {salePriceCents === null ? (
            <span className="text-ink">{formatPrice(priceCents)}</span>
          ) : (
            <>
              <span className="text-sale line-through decoration-1">
                {formatPrice(priceCents)}
              </span>
              <span className="text-ink">{formatPrice(salePriceCents)}</span>
            </>
          )}
        </p>

        <ConditionBadge condition={condition} className="mt-3" />
      </Link>
    </Reveal>
  );
};

export default ProductCard;
