import InteriorPage from "@/components/interior-page";
import CheckoutForm from "@/components/checkout-form";
import { title } from "@/lib/brand";
import { getSettings } from "@/lib/api/settings";

export const metadata = {
  title: title("Checkout"),
  description: "Where the order goes.",
  robots: { index: false, follow: false },
};

const CheckoutPage = async () => {
  const { commerce } = await getSettings();

  return (
    <InteriorPage heading="Checkout" className="max-w-[1000px]">
      <CheckoutForm commerce={commerce} />
    </InteriorPage>
  );
};

export default CheckoutPage;
