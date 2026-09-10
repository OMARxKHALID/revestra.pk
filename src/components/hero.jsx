import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import { HERO_LOGO } from "@/lib/products";
import { getLatestProducts } from "@/lib/api/products";
import cn from "@/lib/utils/cn";
import { BRAND } from "@/lib/brand";

const { logo, width, height, bg } = HERO_LOGO;

const SHELF = [
  "w-[18%] min-w-[68px] max-w-[140px] -rotate-6",
  "w-[14%] min-w-[56px] max-w-[110px] rotate-3",
  "w-[14%] min-w-[56px] max-w-[110px] -rotate-2",
  "w-[16%] min-w-[62px] max-w-[130px] rotate-6",
  "w-[14%] min-w-[56px] max-w-[110px] -rotate-3",
];

const Hero = async () => {
  const latest = await getLatestProducts(SHELF.length);

  return (
    <section className="relative w-full overflow-hidden bg-black">
      <div className="pointer-events-none absolute inset-0">
        <Image
          src={bg}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <SiteHeader overlay />

      <div className="relative mx-auto flex min-h-[88svh] max-w-[1600px] flex-col items-center justify-center px-5 pb-28 pt-[calc(var(--spacing-header)+2rem)] sm:min-h-[78svh] sm:px-4 sm:pb-32 sm:pt-[calc(var(--spacing-header)+3rem)]">
        <h1 className="relative z-10 w-full max-w-[min(92vw,900px)]">
          <Image
            src={logo}
            alt={BRAND.name}
            width={width}
            height={height}
            priority
            fetchPriority="high"
            sizes="(max-width: 768px) 92vw, 900px"
            className="h-auto w-full object-contain"
          />
        </h1>

        <div className="z-10 mt-12 flex w-full items-end justify-center gap-3 sm:absolute sm:inset-x-0 sm:bottom-[8%] sm:mt-0 sm:gap-5 sm:px-4 md:gap-8">
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
                priority={index === 0}
                loading="eager"
                fetchPriority={index === 0 ? "high" : "low"}
                sizes="140px"
                className="h-auto w-full object-contain"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
