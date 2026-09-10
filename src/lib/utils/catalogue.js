export const EMPTY_FILTERS = {
  query: "",
  category: "",
  size: "",
  brand: "",
  condition: "",
  minCents: null,
  maxCents: null,
  availableOnly: false,
};

const FACET_FIELDS = {
  category: "category",
  size: "sizeLabel",
  brand: "brand",
  condition: "condition",
};

const ALPHA_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

const toCents = (value) => {
  if (value === null || value === undefined || String(value).trim() === "")
    return null;

  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) : null;
};

export const toSearchParams = (record = {}) => {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(record)) {
    if (value === undefined) continue;

    params.set(key, Array.isArray(value) ? (value[0] ?? "") : String(value));
  }

  return params;
};

export const readFilters = (searchParams) => ({
  query: (searchParams.get("q") ?? "").trim().toLowerCase(),
  category: searchParams.get("category") ?? "",
  size: searchParams.get("size") ?? "",
  brand: searchParams.get("brand") ?? "",
  condition: searchParams.get("condition") ?? "",
  minCents: toCents(searchParams.get("min")),
  maxCents: toCents(searchParams.get("max")),
  availableOnly: searchParams.get("available") === "1",
});

export const filtersToParams = (filters) => {
  const params = new URLSearchParams();

  if (filters.query) params.set("q", filters.query);
  if (filters.category) params.set("category", filters.category);
  if (filters.size) params.set("size", filters.size);
  if (filters.brand) params.set("brand", filters.brand);
  if (filters.condition) params.set("condition", filters.condition);
  if (filters.minCents !== null) params.set("min", String(filters.minCents / 100));
  if (filters.maxCents !== null) params.set("max", String(filters.maxCents / 100));
  if (filters.availableOnly) params.set("available", "1");

  return params;
};

export const priceOf = (product) => product.salePriceCents ?? product.priceCents;

const matchesQuery = (product, query) =>
  !query ||
  [
    product.name,
    product.brand,
    product.tagline,
    product.description,
    product.category,
    product.sizeLabel,
  ]
    .join(" ")
    .toLowerCase()
    .includes(query);

export const matchesFilters = (product, filters, options = {}) => {
  const skip = options.skip ?? "";

  for (const [key, field] of Object.entries(FACET_FIELDS)) {
    if (key === skip) continue;
    if (filters[key] && product[field] !== filters[key]) return false;
  }

  if (skip !== "price") {
    const price = priceOf(product);

    if (filters.minCents !== null && price < filters.minCents) return false;
    if (filters.maxCents !== null && price > filters.maxCents) return false;
  }

  if (filters.availableOnly && product.status !== "available") return false;

  return matchesQuery(product, filters.query);
};

const compareSizes = (a, b) => {
  const alpha = ALPHA_ORDER.indexOf(a.toUpperCase());
  const beta = ALPHA_ORDER.indexOf(b.toUpperCase());

  if (alpha !== -1 && beta !== -1) return alpha - beta;
  if (alpha !== -1) return -1;
  if (beta !== -1) return 1;

  const first = Number(a.replace(/[^\d.]/g, ""));
  const second = Number(b.replace(/[^\d.]/g, ""));

  if (Number.isFinite(first) && Number.isFinite(second) && first !== second)
    return first - second;

  return a.localeCompare(b);
};

const optionsFor = (products, filters, key) => {
  const field = FACET_FIELDS[key];

  const reachable = products
    .filter((product) => matchesFilters(product, filters, { skip: key }))
    .map((product) => product[field]);

  const selected = filters[key] ? [filters[key]] : [];
  const unique = [...new Set([...reachable, ...selected])];

  return key === "size" ? unique.sort(compareSizes) : unique.sort();
};

const priceBounds = (products) => {
  if (products.length === 0) return { minCents: 0, maxCents: 0 };

  const prices = products.map(priceOf);

  return { minCents: Math.min(...prices), maxCents: Math.max(...prices) };
};

export const buildFacets = (products, filters = EMPTY_FILTERS) => ({
  categories: optionsFor(products, filters, "category"),
  sizes: optionsFor(products, filters, "size"),
  brands: optionsFor(products, filters, "brand"),
  conditions: optionsFor(products, filters, "condition"),
  price: priceBounds(products),
});
