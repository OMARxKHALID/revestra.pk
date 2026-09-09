export const EMPTY_FILTERS = {
  query: "",
  category: "",
  size: "",
  brand: "",
  condition: "",
};

const FACET_FIELDS = {
  category: "category",
  size: "sizeLabel",
  brand: "brand",
  condition: "condition",
};

export const readFilters = (searchParams) => ({
  query: (searchParams.get("q") ?? "").trim().toLowerCase(),
  category: searchParams.get("category") ?? "",
  size: searchParams.get("size") ?? "",
  brand: searchParams.get("brand") ?? "",
  condition: searchParams.get("condition") ?? "",
});

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

export const matchesFilters = (product, filters, { skip } = {}) => {
  for (const [key, field] of Object.entries(FACET_FIELDS)) {
    if (key === skip) continue;
    if (filters[key] && product[field] !== filters[key]) return false;
  }

  return matchesQuery(product, filters.query);
};

const optionsFor = (products, filters, key) => {
  const field = FACET_FIELDS[key];

  const reachable = products
    .filter((product) => matchesFilters(product, filters, { skip: key }))
    .map((product) => product[field]);

  const selected = filters[key] ? [filters[key]] : [];

  return [...new Set([...reachable, ...selected])].sort();
};

export const buildFacets = (products, filters = EMPTY_FILTERS) => ({
  categories: optionsFor(products, filters, "category"),
  sizes: optionsFor(products, filters, "size"),
  brands: optionsFor(products, filters, "brand"),
  conditions: optionsFor(products, filters, "condition"),
});
