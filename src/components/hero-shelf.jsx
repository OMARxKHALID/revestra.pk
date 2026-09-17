import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import cn from "@/lib/utils/cn";
import { getLatestProducts } from "@/lib/api/products";
import { isCatalogueUnavailable } from "@/lib/utils/catalogue-guard";

export const SHELF = [
  "w-[18%] min-w-[68px] max-w-[140px] -rotate-6",
  "w-[14%] min-w-[56px] max-w-[110px] rotate-3",
  "w-[14%] min-w-[56px] max-w-[110px] -rotate-2",
  "w-[16%] min-w-[62px] max-w-[130px] rotate-6",
  "w-[14%] min-w-[56px] max-w-[110px] -rotate-3",
];

export const SHELF_FRAME =
  "z-10 mt-12 flex min-h-[110px] w-full items-end justify-center gap-3 sm:absolute sm:inset-x-0 sm:bottom-[8%] sm:mt-0 sm:min-h-[140px] sm:gap-5 sm:px-4 md:gap-8";

export const HeroShelfFallback = () => (
  <div className={SHELF_FRAME} aria-hidden="true" />
);

const loadLatest = async () => {
  try {
    return await getLatestProducts(SHELF.length);
  } catch (error) {
    if (isCatalogueUnavailable(error)) return [];

    throw error;
  }
};

const HeroShelf = async () => {
  await connection();

  const latest = await loadLatest();

  return (
    <div className={SHELF_FRAME}>
      {latest.map(({ slug, name, image }, index) => (
        <Link
          key={slug}
          href={`/products/${slug}`}
          aria-label={name}
          className={cn(
            "relative shrink-0 drop-shadow-[0_20px_30px_rgba(0,0,0,0.45)] transition-transform duration-300 hover:-translate-y-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white",
            SHELF[index]
          )}
        >
          <Image
            src={image}
            alt={name}
            width={280}
            height={280}
            preload={index === 0}
            loading="eager"
            fetchPriority={index === 0 ? "high" : "low"}
            sizes="140px"
            className="h-auto w-full object-contain"
          />
        </Link>
      ))}
    </div>
  );
};

export default HeroShelf;
