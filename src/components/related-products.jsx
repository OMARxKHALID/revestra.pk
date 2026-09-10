import ProductList from "@/components/product-list";
import cn from "@/lib/utils/cn";
import { META } from "@/lib/type";

const RelatedProducts = ({ products }) => (
  <section className="bg-white px-6 pb-20 pt-16 sm:px-10 sm:pb-28">
    <div className="mx-auto max-w-[1200px] border-t border-rule pt-8">
      <h2 className={cn(META, "pb-10 text-ink-muted")}>
        Related Products
      </h2>

      <ProductList products={products} />
    </div>
  </section>
);

export default RelatedProducts;
