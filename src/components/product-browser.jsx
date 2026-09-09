"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import ProductList from "@/components/product-list";
import cn from "@/lib/utils/cn";
import { EYEBROW, META, TITLE } from "@/lib/type";
import Chip from "@/components/ui/chip";
import Field from "@/components/ui/field";
import { SearchIcon } from "@/components/ui/icons";

const EMPTY = { category: "", size: "", brand: "", condition: "" };

const fetchProducts = async ({ queryKey }) => {
  const [, { query, filters }] = queryKey;
  const params = new URLSearchParams();

  if (query) params.set("q", query);

  for (const [key, value] of Object.entries(filters))
    if (value) params.set(key, value);

  const response = await fetch(`/api/products?${params}`);
  if (!response.ok) throw new Error("Could not load products");

  return response.json();
};

const FacetRow = ({ label, options, value, onSelect }) => {
  if (options.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={cn(META, "mr-1 w-16 shrink-0 text-black/45")}>
        {label}
      </span>

      <Chip selected={value === ""} onClick={() => onSelect("")}>
        All
      </Chip>

      {options.map((option) => (
        <Chip
          key={option}
          selected={value === option}
          onClick={() => onSelect(option)}
        >
          {option}
        </Chip>
      ))}
    </div>
  );
};

const ProductBrowser = ({ initialProducts, initialFacets }) => {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(EMPTY);

  const isDefaultView =
    query === "" && Object.values(filters).every((value) => value === "");

  const { data, isFetching, isError } = useQuery({
    queryKey: ["products", { query, filters }],
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

  const handleReset = () => {
    setQuery("");
    setFilters(EMPTY);
  };

  const handleFilter = (key) => (value) =>
    setFilters((current) => ({ ...current, [key]: value }));

  const handleSearch = (event) => setQuery(event.target.value);

  return (
    <>
      <div className="pb-6 sm:pb-8">
        <Field
          id="product-search"
          label="Search"
          type="search"
          value={query}
          onChange={handleSearch}
          placeholder="Brand, size, anything"
          icon={<SearchIcon className="h-4 w-4" />}
          className="sm:max-w-sm"
        />

        <div className="mt-7 flex flex-col gap-3">
          <FacetRow
            label="Type"
            options={facets?.categories ?? []}
            value={filters.category}
            onSelect={handleFilter("category")}
          />
          <FacetRow
            label="Size"
            options={facets?.sizes ?? []}
            value={filters.size}
            onSelect={handleFilter("size")}
          />
          <FacetRow
            label="Brand"
            options={facets?.brands ?? []}
            value={filters.brand}
            onSelect={handleFilter("brand")}
          />
          <FacetRow
            label="Condition"
            options={facets?.conditions ?? []}
            value={filters.condition}
            onSelect={handleFilter("condition")}
          />
        </div>
      </div>

      <p
        aria-live="polite"
        className={cn(META, "border-t border-black/10 pb-10 pt-6 text-black/45")}
      >
        {isError
          ? "Could not load pieces"
          : `${products.length} ${products.length === 1 ? "piece" : "pieces"}${
              isFetching ? " — updating" : ""
            }`}
      </p>

      {products.length === 0 && !isError ? (
        <div className="border-t border-black/10 py-16 text-center">
          <p className={cn(TITLE, "text-black/70")}>Nothing matches that.</p>

          <button
            type="button"
            onClick={handleReset}
            className={cn(
              EYEBROW,
              "mt-6 text-blurple transition hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blurple"
            )}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <ProductList products={products} />
      )}
    </>
  );
};

export default ProductBrowser;
