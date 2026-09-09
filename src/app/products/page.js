import InteriorPage from "@/components/interior-page";
import ProductBrowser from "@/components/product-browser";
import { getAllProducts } from "@/lib/api/products";
import { buildFacets } from "@/lib/utils/catalogue";
import { BRAND, title } from "@/lib/brand";

export const metadata = {
  title: title("Everything in stock"),
  description: `Secondhand jeans, jackets, shirts, shoes and belts from ${BRAND.name} — each one washed, measured and one of a kind.`,
};

const ProductsPage = async () => {
  const products = await getAllProducts();

  return (
    <InteriorPage
      heading="Everything in stock"
      intro="One of each, measured and washed. When it sells, it is gone."
      className="max-w-[1200px]"
    >
      <div className="mt-10 sm:mt-12">
        <ProductBrowser
          initialProducts={products}
          initialFacets={buildFacets(products)}
        />
      </div>
    </InteriorPage>
  );
};

export default ProductsPage;
