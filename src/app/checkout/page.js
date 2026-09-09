import InteriorPage from "@/components/interior-page";
import CheckoutForm from "@/components/checkout-form";
import { title } from "@/lib/brand";

export const metadata = {
  title: title("Checkout"),
  description: "Where the order goes.",
  robots: { index: false, follow: false },
};

const CheckoutPage = () => (
  <InteriorPage heading="Checkout" className="max-w-[1000px]">
    <CheckoutForm />
  </InteriorPage>
);

export default CheckoutPage;
