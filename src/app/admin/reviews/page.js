import { StarCircleIcon } from "@hugeicons/core-free-icons";
import PageLayout from "@/components/admin/page-layout";
import PageHeader from "@/components/admin/page-header";
import ReviewRow from "@/components/admin/review-row";
import FilterBar from "@/components/admin/filter-bar";
import { Card, CardContent } from "@/components/ui/card";
import { listReviews } from "@/lib/api/admin/reviews";

export const dynamic = "force-dynamic";

const ReviewsPage = async ({ searchParams }) => {
  const { status = "" } = await searchParams;
  const reviews = await listReviews({ status });

  return (
    <PageLayout>
      <PageHeader
        title="Reviews"
        description="Hidden reviews stay in the database but never reach the storefront."
        icon={StarCircleIcon}
      />

      <Card>
        <CardContent className="grid gap-4">
          <FilterBar
            placeholder="Search is not wired for reviews yet"
            filters={[
              {
                key: "status",
                label: "Any state",
                options: [
                  { value: "published", label: "Published" },
                  { value: "hidden", label: "Hidden" },
                ],
              },
            ]}
          />

          <div>
            {reviews.map((review) => (
              <ReviewRow
                key={review.id}
                review={review}
              />
            ))}

            {reviews.length === 0 && (
              <p className="py-12 text-center text-muted-foreground">
                No reviews yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default ReviewsPage;
