"use client";

import useWishlist from "@/store/use-wishlist";
import useWishlistSync from "@/hooks/use-wishlist-sync";
import ProductList from "@/components/product-list";
import PillButton from "@/components/ui/pill-button";
import cn from "@/lib/utils/cn";
import { TITLE } from "@/lib/type";

const WishlistContents = ({ products }) => {
  const slugs = useWishlist((state) => state.slugs);

  useWishlistSync();

  const saved = products.filter((product) => slugs.includes(product.slug));

  if (saved.length === 0)
    return (
      <div className="mt-12 border-t border-rule py-16 text-center">
        <p className={cn(TITLE, "text-ink-muted")}>Nothing saved yet.</p>

        <PillButton href="/products" className="mt-8">
          Browse the store
        </PillButton>
      </div>
    );

  return (
    <div className="mt-12">
      <ProductList products={saved} eager />
    </div>
  );
};

export default WishlistContents;
