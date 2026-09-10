import { Suspense } from "react";
import { notFound } from "next/navigation";
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
import { listCategories } from "@/lib/api/categories";
import { BRAND, title } from "@/lib/brand";

const categoryFor = async (slug) => {
  const found = (await listCategories()).find((entry) => entry.slug === slug);

  return found?.name ?? null;
};

export const generateStaticParams = async () => {
  try {
    return (await listCategories()).map(({ slug }) => ({ category: slug }));
  } catch {
    return [];
  }
};

export const generateMetadata = async ({ params }) => {
  const { category: slug } = await params;
  const category = await categoryFor(slug);

  if (!category) return {};

  return {
    title: title(category),
    description: `Secondhand ${category.toLowerCase()} at ${BRAND.name} — measured, graded and one of a kind.`,
    alternates: { canonical: `/products/category/${slug}` },
  };
};

const loadCatalogue = async () => {
  try {
    return await getSellableProducts();
  } catch (error) {
    if (isCatalogueUnavailable(error)) return null;

    throw error;
  }
};

const LiveBrowser = async ({ category, filters }) => {
  const products = await loadCatalogue();

  if (!products) return <CatalogueUnavailable />;

  const inCategory = products.filter(
    (product) => product.category === category
  );

  return (
    <ProductBrowser
      initialProducts={inCategory.filter((product) =>
        matchesFilters(product, filters)
      )}
      initialFacets={buildFacets(inCategory, filters)}
      initialFilters={filters}
      lockedCategory={category}
    />
  );
};

const CategoryPage = async ({ params, searchParams }) => {
  const { category: slug } = await params;
  const category = await categoryFor(slug);

  if (!category) notFound();

  const filters = {
    ...readFilters(toSearchParams(await searchParams)),
    category,
  };

  return (
    <InteriorPage
      heading={category}
      intro={`Every ${category.toLowerCase().replace(/s$/, "")} in stock, measured and washed.`}
      className="max-w-[1200px]"
    >
      <div className="mt-10 sm:mt-12">
        <Suspense fallback={<Loader label={`Loading ${category.toLowerCase()}`} />}>
          <LiveBrowser category={category} filters={filters} />
        </Suspense>
      </div>
    </InteriorPage>
  );
};

export default CategoryPage;
