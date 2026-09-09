import InteriorPage from "@/components/interior-page";
import CartContents from "@/components/cart-contents";
import { title } from "@/lib/brand";

export const metadata = {
  title: title("Cart"),
  description: "Everything you have picked out so far.",
  robots: { index: false, follow: false },
};

const CartPage = () => (
  <InteriorPage heading="Cart">
    <CartContents />
  </InteriorPage>
);

export default CartPage;
