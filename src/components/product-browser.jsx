"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import ProductList from "@/components/product-list";
import Pager from "@/components/ui/pager";
import useDebounced from "@/hooks/use-debounced";
import cn from "@/lib/utils/cn";
import { BODY, EYEBROW, META, TITLE } from "@/lib/type";
import { EMPTY_FILTERS, filtersToParams } from "@/lib/utils/catalogue";
import { formatPrice } from "@/lib/utils/price";
import Field from "@/components/ui/field";
import { SearchIcon, CloseIcon } from "@/components/ui/icons";
import PillButton from "@/components/ui/pill-button";
import ErrorState from "@/components/ui/error-state";
import { request } from "@/lib/api-client";
import keys from "@/lib/query-keys";
import { track } from "@/lib/track";
import { ANALYTICS_EVENT } from "@/lib/analytics";

const fetchProducts = ({ queryKey, signal }) => {
  const [, , filters] = queryKey;

  return request(`/api/products?${filtersToParams(filters)}`, { signal });
};

const PER_PAGE = 12;

const SelectFilter = ({ id, label, value, options, onSelect }) => {
  if (options.length === 0) return null;

  return (
    <div>
      <label htmlFor={id} className={cn(META, "text-ink-soft")}>
        {label}
      </label>

      <div className="mt-2 border-b border-rule-strong pb-2 focus-within:border-brand">
        <select
          id={id}
          value={value}
          onChange={(event) => onSelect(event.target.value)}
          className="min-h-11 cursor-pointer bg-transparent font-sans text-base text-ink focus:outline-none sm:min-h-0 sm:text-sm"
        >
          <option value="">All</option>

          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

const ProductBrowser = ({
  initialProducts,
  initialFacets,
  initialFilters = EMPTY_FILTERS,
  lockedCategory = "",
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [queryInput, setQueryInput] = useState(initialFilters.query);
  const query = useDebounced(queryInput, 250);

  const active = useMemo(() => ({ ...filters, query }), [filters, query]);

  useEffect(() => {
    if (!query) return;

    track(ANALYTICS_EVENT.productsSearched, { query });
  }, [query]);
  const isDefaultView =
    JSON.stringify(active) ===
    JSON.stringify({ ...EMPTY_FILTERS, ...initialFilters });

  useEffect(() => {
    const next = filtersToParams(active).toString();

    if (next === searchParams.toString()) return;

    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [active, pathname, router, searchParams]);

  const { data, isFetching, isError, error, refetch } = useQuery({
    queryKey: keys.products.list(active),
    queryFn: fetchProducts,
    placeholderData: keepPreviousData,
    initialData: isDefaultView
      ? {
          products: initialProducts,
          total: initialProducts.length,
          facets: initialFacets,
        }
      : undefined,
  });

  const products = data?.products ?? [];
  const facets = data?.facets ?? initialFacets;
  const bounds = facets?.price ?? { minCents: 0, maxCents: 0 };

  const handleReset = () => {
    setFilters({ ...EMPTY_FILTERS, category: lockedCategory });
    setQueryInput("");
  };

  const handleFilter = (key) => (value) => {
    track(ANALYTICS_EVENT.productListFiltered, { filter: key, value });

    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const handlePrice = (key) => (event) => {
    const digits = event.target.value.replace(/[^\d]/g, "");

    setPage(1);
    setFilters((current) => ({
      ...current,
      [key]: digits === "" ? null : Number(digits) * 100,
    }));
  };

  const handleAvailable = () =>
    setFilters((current) => ({
      ...current,
      availableOnly: !current.availableOnly,
    }));

  const handleSearch = (event) => {
    setPage(1);
    setQueryInput(event.target.value);
  };

  const pages = Math.max(1, Math.ceil(products.length / PER_PAGE));
  const current = Math.min(page, pages);
  const visible = products.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const handlePage = (target) => {
    setPage(target);
    document.getElementById("results")?.scrollIntoView({ block: "start" });
  };

  const activeFilters = [
    { key: "category", label: "Type", value: filters.category },
    { key: "size", label: "Size", value: filters.size },
    { key: "brand", label: "Brand", value: filters.brand },
    { key: "condition", label: "Condition", value: filters.condition },
  ]
    .filter(({ key, value }) => value && !(key === "category" && lockedCategory))
    .map((entry) => ({ ...entry, clear: () => handleFilter(entry.key)("") }));

  if (filters.minCents !== null || filters.maxCents !== null)
    activeFilters.push({
      key: "price",
      label: "Price",
      value: `${formatPrice(filters.minCents ?? bounds.minCents)} – ${formatPrice(
        filters.maxCents ?? bounds.maxCents
      )}`,
      clear: () =>
        setFilters((current) => ({
          ...current,
          minCents: null,
          maxCents: null,
        })),
    });

  if (filters.availableOnly)
    activeFilters.push({
      key: "availableOnly",
      label: "Stock",
      value: "Available only",
      clear: handleAvailable,
    });

  return (
    <>
      <div className="border-b border-rule pb-5">
        <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
          <div className="relative min-w-[190px] flex-1">
            <label htmlFor="product-search" className={cn(META, "text-ink-soft")}>
              Search
            </label>

            <div className="mt-2 flex items-center gap-2 border-b border-rule-strong pb-2 focus-within:border-brand">
              <SearchIcon className="h-4 w-4 shrink-0 text-ink-faint" />

              <input
                id="product-search"
                type="search"
                value={queryInput}
                onChange={handleSearch}
                placeholder="Brand, size, anything"
                className="min-h-11 w-full bg-transparent font-sans text-base text-ink placeholder:text-ink-faint focus:outline-none sm:min-h-0 sm:text-sm"
              />
            </div>
          </div>

          {!lockedCategory && (
            <SelectFilter
              id="filter-category"
              label="Type"
              value={filters.category}
              options={facets?.categories ?? []}
              onSelect={handleFilter("category")}
            />
          )}

          <SelectFilter
            id="filter-size"
            label="Size"
            value={filters.size}
            options={facets?.sizes ?? []}
            onSelect={handleFilter("size")}
          />

          <SelectFilter
            id="filter-brand"
            label="Brand"
            value={filters.brand}
            options={facets?.brands ?? []}
            onSelect={handleFilter("brand")}
          />

          <SelectFilter
            id="filter-condition"
            label="Condition"
            value={filters.condition}
            options={facets?.conditions ?? []}
            onSelect={handleFilter("condition")}
          />

          <div>
            <span className={cn(META, "text-ink-soft")}>Price</span>

            <div className="mt-2 flex items-center gap-2 border-b border-rule-strong pb-2 focus-within:border-brand">
              <span className={cn(META, "text-ink-faint")}>Rs</span>

              <label htmlFor="price-min" className="sr-only">
                Lowest price in rupees
              </label>
              <input
                id="price-min"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={filters.minCents === null ? "" : filters.minCents / 100}
                onChange={handlePrice("minCents")}
                placeholder={String(Math.floor(bounds.minCents / 100))}
                className="min-h-11 w-16 bg-transparent font-sans text-base text-ink tabular-nums placeholder:text-ink-faint focus:outline-none sm:min-h-0 sm:w-14 sm:text-sm"
              />

              <span className={cn(META, "text-ink-faint")}>to</span>

              <label htmlFor="price-max" className="sr-only">
                Highest price in rupees
              </label>
              <input
                id="price-max"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={filters.maxCents === null ? "" : filters.maxCents / 100}
                onChange={handlePrice("maxCents")}
                placeholder={String(Math.ceil(bounds.maxCents / 100))}
                className="min-h-11 w-16 bg-transparent font-sans text-base text-ink tabular-nums placeholder:text-ink-faint focus:outline-none sm:min-h-0 sm:w-14 sm:text-sm"
              />
            </div>
          </div>

          <label className="flex min-h-11 cursor-pointer items-center gap-2 pb-2 sm:min-h-0">
            <input
              type="checkbox"
              checked={filters.availableOnly}
              onChange={handleAvailable}
              className="size-5 accent-brand sm:size-3.5"
            />
            <span className={cn(META, "text-ink-muted")}>Available only</span>
          </label>
        </div>

        {activeFilters.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {activeFilters.map(({ key, label, value, clear }) => (
              <button
                key={key}
                type="button"
                onClick={clear}
                aria-label={`Remove ${label} filter`}
                className={cn(
                  META,
                  "flex items-center gap-1.5 rounded-full border border-brand bg-brand/5 px-3 py-1.5 text-brand transition hover:bg-brand hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                )}
              >
                {label}: {value}
                <CloseIcon className="h-3 w-3" />
              </button>
            ))}

            <button
              type="button"
              onClick={handleReset}
              className={cn(META, "ml-1 text-ink-soft underline hover:text-ink")}
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {!isError && (
        <p
          id="results"
          aria-live="polite"
          className={cn(META, "border-t border-rule pb-10 pt-6 text-ink-soft")}
        >
          {`${products.length} ${products.length === 1 ? "piece" : "pieces"}`}
          {pages > 1 && ` · page ${current} of ${pages}`}
          {isFetching && " — updating"}
        </p>
      )}

      {isError ? (
        <ErrorState
          error={error}
          eyebrow="Could not load"
          actions={<PillButton onClick={() => refetch()}>Try again</PillButton>}
        />
      ) : products.length === 0 ? (
        <div className="border-t border-rule py-16 text-center">
          <p className={cn(TITLE, "text-ink-muted")}>
            {activeFilters.length > 0 || queryInput
              ? "Nothing matches that."
              : "The rail is empty right now."}
          </p>

          {activeFilters.length > 0 || queryInput ? (
            <button
              type="button"
              onClick={handleReset}
              className={cn(
                EYEBROW,
                "mt-6 text-brand transition hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
              )}
            >
              Clear filters
            </button>
          ) : (
            <p className={cn(BODY, "mt-3 text-ink-soft")}>
              New pieces are added as they are washed and measured. Check back
              shortly.
            </p>
          )}
        </div>
      ) : (
        <>
          <ProductList products={visible} eager />

          <Pager
            page={current}
            pages={pages}
            onSelect={handlePage}
            className="mt-16"
          />
        </>
      )}
    </>
  );
};

export default ProductBrowser;
