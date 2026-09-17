import ProductCard from "@/components/product-card";

const ProductList = ({ products, eager = false }) => (
  <div className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-16 lg:grid-cols-3 lg:gap-y-20">
    {products.map((product, index) => (
      <ProductCard
        key={product.slug}
        index={index}
        eager={eager && index < 3}
        {...product}
      />
    ))}
  </div>
);

export default ProductList;
