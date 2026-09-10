import { Suspense } from "react";
import Image from "next/image";
import SiteHeader from "@/components/site-header";
import HeroShelf, { HeroShelfFallback } from "@/components/hero-shelf";
import { HERO_LOGO } from "@/lib/products";
import { BRAND } from "@/lib/brand";

const { logo, width, height, bg } = HERO_LOGO;

const Hero = () => (
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

      <Suspense fallback={<HeroShelfFallback />}>
        <HeroShelf />
      </Suspense>
    </div>
  </section>
);

export default Hero;
