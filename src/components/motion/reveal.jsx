"use client";

import useInView from "@/hooks/use-in-view";
import cn from "@/lib/utils/cn";

const REVEAL_DELAYS = [
  "motion-safe:[animation-delay:0ms]",
  "motion-safe:[animation-delay:80ms]",
  "motion-safe:[animation-delay:160ms]",
];

const Reveal = ({ index = 0, className, children }) => {
  const [ref, state] = useInView({ threshold: 0.15 });

  return (
    <div
      ref={ref}
      className={cn(
        state === "hidden" && "opacity-0",
        state === "revealed" && [
          "motion-safe:animate-fade-up",
          REVEAL_DELAYS[index % REVEAL_DELAYS.length],
        ],
        className
      )}
    >
      {children}
    </div>
  );
};

export default Reveal;
