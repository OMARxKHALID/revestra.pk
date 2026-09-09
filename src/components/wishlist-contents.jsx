"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import useWishlist from "@/store/use-wishlist";
import ProductList from "@/components/product-list";
import PillButton from "@/components/ui/pill-button";
import cn from "@/lib/utils/cn";
import { TITLE } from "@/lib/type";

const WishlistContents = ({ products }) => {
  const slugs = useWishlist((state) => state.slugs);
  const merge = useWishlist((state) => state.merge);
  const { status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;

    let cancelled = false;

    const sync = async () => {
      try {
        const response = await fetch("/api/wishlist");

        if (!response.ok) return;

        const body = await response.json();

        if (cancelled) return;

        const remote = body.slugs ?? [];
        const local = useWishlist.getState().slugs;
        const union = [...new Set([...local, ...remote])];

        merge(remote);

        if (union.length !== remote.length)
          await fetch("/api/wishlist", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slugs: union }),
          });
      } catch {
        return;
      }
    };

    sync();

    return () => {
      cancelled = true;
    };
  }, [status, merge]);

  const saved = products.filter((product) => slugs.includes(product.slug));

  if (saved.length === 0)
    return (
      <div className="mt-12 border-t border-black/10 py-16 text-center">
        <p className={cn(TITLE, "text-black/70")}>Nothing saved yet.</p>

        <PillButton href="/products" className="mt-8">
          Browse the store
        </PillButton>
      </div>
    );

  return (
    <div className="mt-12">
      <ProductList products={saved} />
    </div>
  );
};

export default WishlistContents;
