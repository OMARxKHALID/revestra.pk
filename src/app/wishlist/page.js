import { Suspense } from "react";
import { connection } from "next/server";
import InteriorPage from "@/components/interior-page";
import WishlistContents from "@/components/wishlist-contents";
import { getSellableProducts } from "@/lib/api/products";
import { title } from "@/lib/brand";

export const metadata = {
  title: title("Wishlist"),
  robots: { index: false, follow: false },
};

const LiveWishlist = async () => {
  await connection();

  return <WishlistContents products={await getSellableProducts()} />;
};

const WishlistPage = () => (
  <InteriorPage heading="Saved for later" className="max-w-[1200px]">
    <Suspense fallback={<div className="min-h-[60svh]" aria-hidden="true" />}>
      <LiveWishlist />
    </Suspense>
  </InteriorPage>
);

export default WishlistPage;
