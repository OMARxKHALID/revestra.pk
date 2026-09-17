import { redirect } from "next/navigation";
import InteriorPage from "@/components/interior-page";
import AccountReviews from "@/components/account-reviews";
import { auth } from "@/auth";
import { listReviewsForUser } from "@/lib/api/reviews";
import { title } from "@/lib/brand";

export const dynamic = "force-dynamic";

export const metadata = {
  title: title("Your reviews"),
  robots: { index: false, follow: false },
};

const AccountReviewsPage = async () => {
  const session = await auth();

  if (!session?.user) redirect("/sign-in?callbackUrl=/account/reviews");

  const reviews = await listReviewsForUser(session.user.id);

  return (
    <InteriorPage
      eyebrow="Account"
      heading="Your reviews"
      intro="Everything you have written about the shop."
    >
      <AccountReviews reviews={reviews} />
    </InteriorPage>
  );
};

export default AccountReviewsPage;
