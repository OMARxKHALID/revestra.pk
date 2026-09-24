"use client";

import useWishlist from "@/store/use-wishlist";
import useWishlistSync from "@/hooks/use-wishlist-sync";
import ProductList from "@/components/product-list";
import PillButton from "@/components/ui/pill-button";
import SpiralTexture from "@/components/ui/spiral-texture";
import cn from "@/lib/utils/cn";
import { TITLE } from "@/lib/type";

const WishlistContents = ({ products }) => {
  const slugs = useWishlist((state) => state.slugs);

  useWishlistSync();

  const saved = products.filter((product) => slugs.includes(product.slug));

  if (saved.length === 0)
    return (
      <div className="relative isolate mt-12 overflow-hidden border-t border-rule py-24 text-center">
        <SpiralTexture className="left-1/2 top-1/2 w-[280px] -translate-x-1/2 -translate-y-1/2 text-brand opacity-[0.06]" />
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
