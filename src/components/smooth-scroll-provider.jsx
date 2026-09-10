"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

const SmoothScrollProvider = ({ children }) => {
  const pathname = usePathname();
  const disabled = pathname?.startsWith("/admin") ?? false;

  useEffect(() => {
    if (disabled) return;

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");

    let lenis;
    let rafId;

    const start = () => {
      lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.1,
        anchors: true,
      });

      const raf = (time) => {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    };

    const stop = () => {
      cancelAnimationFrame(rafId);
      lenis?.destroy();
      lenis = undefined;
    };

    const handleChange = () => {
      stop();
      if (!query.matches) start();
    };

    handleChange();
    query.addEventListener("change", handleChange);

    return () => {
      query.removeEventListener("change", handleChange);
      stop();
    };
  }, [disabled]);

  return <>{children}</>;
};

export default SmoothScrollProvider;
