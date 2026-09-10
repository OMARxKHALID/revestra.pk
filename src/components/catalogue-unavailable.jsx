import PillButton from "@/components/ui/pill-button";
import ErrorState from "@/components/ui/error-state";

const CatalogueUnavailable = ({ className }) => (
  <ErrorState
    eyebrow="Catalogue offline"
    title="The shop is catching its breath"
    message="We could not reach our catalogue just now. Nothing in your cart was lost — reload in a moment and it should be back."
    className={className}
    actions={<PillButton href="/products">Reload the shop</PillButton>}
  />
);

export default CatalogueUnavailable;
