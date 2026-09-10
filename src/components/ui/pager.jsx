"use client";

import cn from "@/lib/utils/cn";
import { META } from "@/lib/type";

const windowed = (page, pages) => {
  if (pages <= 7) return Array.from({ length: pages }, (_, index) => index + 1);

  const middle = [page - 1, page, page + 1].filter(
    (entry) => entry > 1 && entry < pages
  );

  return [
    1,
    ...(middle[0] > 2 ? ["…"] : []),
    ...middle,
    ...(middle[middle.length - 1] < pages - 1 ? ["…"] : []),
    pages,
  ];
};

const Pager = ({ page, pages, onSelect, className }) => {
  if (pages <= 1) return null;

  const step = (target) => () => onSelect(Math.min(pages, Math.max(1, target)));

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex flex-wrap items-center justify-center gap-2", className)}
    >
      <button
        type="button"
        onClick={step(page - 1)}
        disabled={page === 1}
        className={cn(
          META,
          "rounded-full border border-rule-strong px-4 py-2 text-ink-muted transition hover:border-ink-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blurple"
        )}
      >
        Previous
      </button>

      {windowed(page, pages).map((entry, index) =>
        entry === "…" ? (
          <span key={`gap-${index}`} className={cn(META, "px-1 text-ink-faint")}>
            …
          </span>
        ) : (
          <button
            key={entry}
            type="button"
            onClick={step(entry)}
            aria-current={entry === page ? "page" : undefined}
            className={cn(
              META,
              "min-w-9 rounded-full border px-3 py-2 tabular-nums transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blurple",
              entry === page
                ? "border-blurple bg-blurple text-white"
                : "border-rule-strong text-ink-muted hover:border-ink-muted hover:text-ink"
            )}
          >
            {entry}
          </button>
        )
      )}

      <button
        type="button"
        onClick={step(page + 1)}
        disabled={page === pages}
        className={cn(
          META,
          "rounded-full border border-rule-strong px-4 py-2 text-ink-muted transition hover:border-ink-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blurple"
        )}
      >
        Next
      </button>
    </nav>
  );
};

export default Pager;
