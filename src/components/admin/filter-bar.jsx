"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import useDebounced from "@/hooks/use-debounced";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL = "__all";

const labelsFor = (filter) =>
  filter.options.reduce(
    (labels, option) => ({ ...labels, [option.value]: option.label }),
    { [ALL]: filter.label }
  );

const hrefWith = (pathname, params, key, value) => {
  const next = new URLSearchParams(params);

  if (value) next.set(key, value);
  else next.delete(key);

  next.delete("page");

  return next.size ? `${pathname}?${next}` : pathname;
};

const FilterBar = ({ placeholder = "Search", filters = [] }) => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [query, setQuery] = useState(params.get("q") ?? "");
  const settled = useDebounced(query, 300);
  const pushed = useRef(settled);

  useEffect(() => {
    if (settled === pushed.current) return;

    pushed.current = settled;
    router.replace(hrefWith(pathname, params, "q", settled), { scroll: false });
  }, [settled, params, pathname, router]);

  const handleFilter = (key) => (value) =>
    router.replace(hrefWith(pathname, params, key, value === ALL ? "" : value), {
      scroll: false,
    });

  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      className="flex flex-col gap-3 sm:flex-row sm:items-center"
    >
      <div className="relative w-full sm:max-w-xs">
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
          <HugeiconsIcon icon={Search01Icon} size={16} />
        </span>

        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          className="pl-8"
          aria-label={placeholder}
        />
      </div>

      {filters.map((filter) => (
        <Select
          key={filter.key}
          items={labelsFor(filter)}
          value={params.get(filter.key) || ALL}
          onValueChange={handleFilter(filter.key)}
        >
          <SelectTrigger className="w-full sm:w-[190px]">
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value={ALL}>{filter.label}</SelectItem>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </form>
  );
};

export default FilterBar;
