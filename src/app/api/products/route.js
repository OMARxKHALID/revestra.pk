import { getSellableProducts } from "@/lib/api/products";
import { buildFacets, matchesFilters, readFilters } from "@/lib/utils/catalogue";

export const GET = async (request) => {
  const filters = readFilters(new URL(request.url).searchParams);
  const products = await getSellableProducts();
  const filtered = products.filter((product) =>
    matchesFilters(product, filters)
  );

  return Response.json({
    products: filtered,
    total: filtered.length,
    facets: buildFacets(products, filters),
  });
};
