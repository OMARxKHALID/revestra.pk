import { Suspense } from "react";
import { connection } from "next/server";
import InteriorPage from "@/components/interior-page";
import StoreReviews from "@/components/store-reviews";
import { getReviews, summarise } from "@/lib/api/reviews";
import { BRAND, title } from "@/lib/brand";

export const metadata = {
  title: title("Reviews"),
  description: `What people say about buying secondhand from ${BRAND.name}.`,
};

const LiveReviews = async () => {
  await connection();

  const reviews = await getReviews();

  return (
    <StoreReviews initialReviews={reviews} initialSummary={summarise(reviews)} />
  );
};

const ReviewsPage = () => (
  <InteriorPage
    heading="What buyers say"
    intro="Every piece here is secondhand and one of one, so the thing worth judging is us — how we grade, how we describe, and how it turns up."
  >
    <div className="mt-12">
      <Suspense fallback={null}>
        <LiveReviews />
      </Suspense>
    </div>
  </InteriorPage>
);

export default ReviewsPage;
