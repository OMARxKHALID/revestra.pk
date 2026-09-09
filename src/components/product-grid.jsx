import MonogramMark from "@/components/monogram-mark";
import ProductList from "@/components/product-list";
import { getAllProducts } from "@/lib/api/products";

const ProductGrid = async () => {
  const products = await getAllProducts();

  return (
    <section id="shop" className="bg-white px-6 pb-24 pt-12 sm:px-10 sm:pb-32 sm:pt-16">
      <div className="mx-auto max-w-[1200px]">
        <h2 className="sr-only">Shop</h2>

        <div className="flex justify-center pb-12 sm:pb-16">
          <MonogramMark />
        </div>

        <ProductList products={products} />
      </div>
    </section>
  );
};

export default ProductGrid;
