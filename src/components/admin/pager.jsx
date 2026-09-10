"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const Pager = ({ page, perPage, total }) => {
  const pathname = usePathname();
  const params = useSearchParams();
  const pages = Math.max(1, Math.ceil(total / perPage));

  if (pages <= 1) return null;

  const href = (target) => {
    const next = new URLSearchParams(params);
    next.set("page", String(target));

    return `${pathname}?${next.toString()}`;
  };

  const hasPrevious = page > 1;
  const hasNext = page < pages;

  return (
    <div className="flex items-center justify-between gap-4 pt-2">
      <p className="text-xs text-muted-foreground">
        Page {page} of {pages} · {total} in total
      </p>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPrevious}
          nativeButton={!hasPrevious}
          render={hasPrevious ? <Link href={href(page - 1)} /> : undefined}
        >
          Previous
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={!hasNext}
          nativeButton={!hasNext}
          render={hasNext ? <Link href={href(page + 1)} /> : undefined}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Pager;
