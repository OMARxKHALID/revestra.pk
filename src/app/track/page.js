import InteriorPage from "@/components/interior-page";
import TrackForm from "@/components/track-form";
import { title } from "@/lib/brand";

export const metadata = {
  title: title("Track your order"),
  robots: { index: false, follow: false },
};

const TrackPage = () => (
  <InteriorPage
    heading="Track your order"
    intro="Enter the reference from your confirmation, along with the email you ordered with."
  >
    <TrackForm />
  </InteriorPage>
);

export default TrackPage;
