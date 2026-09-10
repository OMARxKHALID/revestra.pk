import { Suspense } from "react";
import { connection } from "next/server";
import ProductList from "@/components/product-list";
import Loader from "@/components/ui/loader";
import cn from "@/lib/utils/cn";
import { BODY, TITLE } from "@/lib/type";
import { getSellableProducts } from "@/lib/api/products";
import { isCatalogueUnavailable } from "@/lib/utils/catalogue-guard";
import CatalogueUnavailable from "@/components/catalogue-unavailable";

const loadProducts = async () => {
  try {
    return { products: await getSellableProducts() };
  } catch (error) {
    if (isCatalogueUnavailable(error)) return { products: null };

    throw error;
  }
};

const LiveProductList = async () => {
  await connection();

  const { products } = await loadProducts();

  if (!products) return <CatalogueUnavailable />;

  if (products.length === 0)
    return (
      <div className="border-t border-rule py-16 text-center">
        <p className={cn(TITLE, "text-ink-muted")}>The rail is empty right now.</p>
        <p className={cn(BODY, "mt-3 text-ink-soft")}>
          New pieces are added as they are washed and measured.
        </p>
      </div>
    );

  return <ProductList products={products} />;
};

const ProductGrid = () => (
  <section id="shop" className="bg-white px-6 pb-24 pt-12 sm:px-10 sm:pb-32 sm:pt-16">
    <div className="mx-auto max-w-[1200px]">
      <h2 className="sr-only">Shop</h2>

      <Suspense
        fallback={<Loader label="Loading the latest pieces" className="min-h-[70svh]" />}
      >
        <LiveProductList />
      </Suspense>
    </div>
  </section>
);

export default ProductGrid;
