import { getAllProducts } from "@/lib/api/products";

const matches = (product, { query, category, size, brand, condition }) => {
  if (category && product.category !== category) return false;
  if (size && product.sizeLabel !== size) return false;
  if (brand && product.brand !== brand) return false;
  if (condition && product.condition !== condition) return false;
  if (!query) return true;

  return [
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
};

export const GET = async (request) => {
  const { searchParams } = new URL(request.url);

  const filters = {
    query: (searchParams.get("q") ?? "").trim().toLowerCase(),
    category: searchParams.get("category") ?? "",
    size: searchParams.get("size") ?? "",
    brand: searchParams.get("brand") ?? "",
    condition: searchParams.get("condition") ?? "",
  };

  const products = await getAllProducts();
  const filtered = products.filter((product) => matches(product, filters));

  const unique = (key) => [...new Set(products.map((p) => p[key]))].sort();

  return Response.json({
    products: filtered,
    total: filtered.length,
    facets: {
      sizes: unique("sizeLabel"),
      brands: unique("brand"),
      conditions: unique("condition"),
    },
  });
};
