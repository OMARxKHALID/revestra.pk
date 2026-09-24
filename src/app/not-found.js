import InteriorPage from "@/components/interior-page";
import PillButton from "@/components/ui/pill-button";
import { title } from "@/lib/brand";

export const metadata = {
  title: title("Not Found"),
};

const NotFound = () => (
  <InteriorPage
    centered
    texture
    eyebrow="Error 404"
    heading="Out of stock, or never stocked"
    intro="The page you asked for is not here. It may have sold out, or it may never have existed in the first place."
  >
    <PillButton href="/products" className="mt-10">
      Back to the shop
    </PillButton>
  </InteriorPage>
);

export default NotFound;
