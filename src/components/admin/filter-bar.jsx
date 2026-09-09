"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
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

const FilterBar = ({ placeholder = "Search", filters = [] }) => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");

  const push = (next) => {
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const next = new URLSearchParams(params);

    if (query) next.set("q", query);
    else next.delete("q");

    push(next);
  };

  const handleFilter = (key) => (value) => {
    const next = new URLSearchParams(params);

    if (value === ALL) next.delete(key);
    else next.set(key, value);

    push(next);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 sm:flex-row sm:items-center"
    >
      <div className="relative w-full sm:max-w-xs">
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
          <HugeiconsIcon icon={Search01Icon} size={16} />
        </span>

        <Input
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
          value={params.get(filter.key) ?? ALL}
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
