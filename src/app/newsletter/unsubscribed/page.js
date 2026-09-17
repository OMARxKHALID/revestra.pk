import InteriorPage from "@/components/interior-page";
import PillButton from "@/components/ui/pill-button";
import { title } from "@/lib/brand";

export const metadata = {
  title: title("Newsletter"),
  robots: { index: false, follow: false },
};

const UnsubscribedPage = async ({ searchParams }) => {
  const { ok } = await searchParams;
  const done = ok !== "0";

  return (
    <InteriorPage
      centered
      eyebrow="Newsletter"
      eyebrowTone={done ? "text-blurple" : "text-sale"}
      heading={done ? "You are unsubscribed" : "That link did not work"}
      intro={
        done
          ? "No more newsletters will reach you. You can sign up again from the footer whenever you like."
          : "The link may have been broken by your email app. Write to us and we will take you off the list."
      }
      className="max-w-[560px]"
    >
      <PillButton href="/products" className="mt-10">
        Back to the shop
      </PillButton>
    </InteriorPage>
  );
};

export default UnsubscribedPage;
