import { StarCircleIcon } from "@hugeicons/core-free-icons";
import PageLayout from "@/components/admin/page-layout";
import PageHeader from "@/components/admin/page-header";
import ReviewRow from "@/components/admin/review-row";
import FilterBar from "@/components/admin/filter-bar";
import { Card, CardContent } from "@/components/ui/card";
import Pager from "@/components/admin/pager";
import { listReviews } from "@/lib/api/admin/reviews";
import { listQuerySchema } from "@/lib/schemas/admin";

export const dynamic = "force-dynamic";

const ReviewsPage = async ({ searchParams }) => {
  const query = listQuerySchema.parse(await searchParams);
  const { reviews, total, page, perPage } = await listReviews(query);

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

          <Pager page={page} perPage={perPage} total={total} />
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default ReviewsPage;
