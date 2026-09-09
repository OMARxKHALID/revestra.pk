"use client";

import { useState } from "react";
import Image from "next/image";
import SiteHeader from "@/components/site-header";
import ThemeSwitcher from "@/components/theme-switcher";
import { HERO_PRODUCTS, LOGO_THEMES } from "@/lib/products";
import cn from "@/lib/utils/cn";
import { BRAND } from "@/lib/brand";

const Hero = () => {
  const [theme, setTheme] = useState("jitter");
  const { logo, width, height, bg } = LOGO_THEMES[theme];

  return (
    <section className="relative w-full overflow-hidden bg-black">
      <div className="pointer-events-none absolute inset-0">
        <Image
          src={bg}
          alt=""
          fill
          priority
          sizes="100vw"
          className={cn(
            "object-cover object-center",
            theme === "transparent" && "opacity-90"
          )}
        />
        {theme !== "transparent" && (
          <div className="absolute inset-0 bg-black/20" />
        )}
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
          {HERO_PRODUCTS.map(({ alt, image, className }, index) => (
            <div
              key={alt}
              className={cn(
                "relative shrink-0 drop-shadow-[0_20px_30px_rgba(0,0,0,0.45)]",
                className
              )}
            >
              <Image
                src={image}
                alt={alt}
                width={280}
                height={280}
                priority={index === 0}
                loading="eager"
                fetchPriority={index === 0 ? "high" : "low"}
                sizes="140px"
                className="h-auto w-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      <ThemeSwitcher theme={theme} setTheme={setTheme} />
    </section>
  );
};

export default Hero;
