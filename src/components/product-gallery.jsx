"use client";

import { useState } from "react";
import Image from "next/image";
import cn from "@/lib/utils/cn";
import { META } from "@/lib/type";

const ProductGallery = ({ frames, name, sold = false, label }) => {
  const [active, setActive] = useState(0);
  const single = frames.length < 2;

  const handleSelect = (index) => setActive(index);

  return (
    <div className="flex flex-col gap-6">
      <div className="relative flex aspect-square items-center justify-center bg-white">
        {label && (
          <span
            className={cn(
              META,
              "absolute left-0 top-0 z-10 px-3 py-2 text-white",
              sold ? "bg-black" : "bg-blurple"
            )}
          >
            {label}
          </span>
        )}

        <Image
          key={frames[active]}
          src={frames[active]}
          alt={name}
          width={900}
          height={900}
          preload={active === 0}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className={cn(
            "h-auto w-[78%] object-contain",
            sold && "opacity-50"
          )}
        />
      </div>

      {!single && (
        <div
          role="group"
          aria-label={`${name} — other views`}
          className="flex flex-wrap justify-center gap-3"
        >
          {frames.map((frame, index) => (
            <button
              key={frame}
              type="button"
              onClick={() => handleSelect(index)}
              aria-label={`${name} — view ${index + 1}`}
              aria-pressed={index === active}
              className={cn(
                "flex h-16 w-16 items-center justify-center border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blurple",
                index === active
                  ? "border-blurple"
                  : "border-rule hover:border-ink-muted"
              )}
            >
              <Image
                src={frame}
                alt=""
                width={64}
                height={64}
                className="h-[78%] w-auto object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
