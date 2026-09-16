import { Suspense } from "react";
import InteriorPage from "@/components/interior-page";
import ProductBrowser from "@/components/product-browser";
import CatalogueUnavailable from "@/components/catalogue-unavailable";
import Loader from "@/components/ui/loader";
import { getSellableProducts } from "@/lib/api/products";
import { isCatalogueUnavailable } from "@/lib/utils/catalogue-guard";
import {
  buildFacets,
  matchesFilters,
  readFilters,
  toSearchParams,
} from "@/lib/utils/catalogue";
import { BRAND, title } from "@/lib/brand";

export const metadata = {
  title: title("Everything in stock"),
  description: `Secondhand jeans, jackets, shirts, shoes and belts from ${BRAND.name} — each one washed, measured and one of a kind.`,
};

const loadCatalogue = async () => {
  try {
    return await getSellableProducts();
  } catch (error) {
    if (isCatalogueUnavailable(error)) return null;

    throw error;
  }
};

const LiveBrowser = async ({ searchParams }) => {
  const filters = readFilters(toSearchParams(await searchParams));
  const products = await loadCatalogue();

  if (!products) return <CatalogueUnavailable />;

  return (
    <ProductBrowser
      initialProducts={products.filter((product) =>
        matchesFilters(product, filters)
      )}
      initialFacets={buildFacets(products, filters)}
      initialFilters={filters}
    />
  );
};

const ProductsPage = ({ searchParams }) => (
  <InteriorPage
    heading="Everything in stock"
    intro="One of each, measured and washed. When it sells, it is gone."
    className="max-w-[1200px]"
  >
    <div className="mt-10 sm:mt-12">
      <Suspense
        fallback={<Loader label="Loading the catalogue" className="min-h-[60svh]" />}
      >
        <LiveBrowser searchParams={searchParams} />
      </Suspense>
    </div>
  </InteriorPage>
);

export default ProductsPage;
