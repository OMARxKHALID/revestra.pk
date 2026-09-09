import InteriorPage from "@/components/interior-page";
import WishlistContents from "@/components/wishlist-contents";
import { getAllProducts } from "@/lib/api/products";
import { title } from "@/lib/brand";

export const metadata = {
  title: title("Wishlist"),
  robots: { index: false, follow: false },
};

const WishlistPage = async () => {
  const products = await getAllProducts();

  return (
    <InteriorPage heading="Saved for later" className="max-w-[1200px]">
      <WishlistContents products={products} />
    </InteriorPage>
  );
};

export default WishlistPage;
