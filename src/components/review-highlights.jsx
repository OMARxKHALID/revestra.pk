import Link from "next/link";
import { connection } from "next/server";
import RatingStars from "@/components/ui/rating-stars";
import cn from "@/lib/utils/cn";
import { BODY, EYEBROW, HEADING, META } from "@/lib/type";
import { CheckIcon } from "@/components/ui/icons";
import { getReviewHighlights } from "@/lib/api/reviews";

const load = async () => {
  try {
    return await getReviewHighlights();
  } catch {
    return { summary: { count: 0, average: null, histogram: {} }, reviews: [] };
  }
};

const ReviewHighlights = async () => {
  await connection();

  const { summary, reviews } = await load();

  if (summary.count === 0) return null;

  return (
    <section className="border-t border-rule bg-white px-6 py-20 sm:px-10 sm:py-24">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div>
            <p className={cn(EYEBROW, "text-blurple")}>What buyers say</p>

            <h2 className={cn(HEADING, "mt-3 text-ink")}>
              {summary.average} out of 5, across {summary.count}{" "}
              {summary.count === 1 ? "review" : "reviews"}
            </h2>
          </div>

          <Link
            href="/reviews"
            className={cn(
              EYEBROW,
              "text-blurple transition hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blurple"
            )}
          >
            Read them all
          </Link>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <li key={review.id ?? `${review.author}-${review.createdAt}`}>
              <RatingStars average={review.rating} showCount={false} />

              <p className={cn(BODY, "mt-4 font-medium text-ink")}>
                {review.title}
              </p>

              <p className={cn(BODY, "mt-2 text-ink-muted")}>{review.body}</p>

              <p
                className={cn(
                  META,
                  "mt-4 flex items-center gap-1.5 text-ink-soft"
                )}
              >
                {review.author}

                {review.verified && (
                  <span className="flex items-center gap-1 text-blurple">
                    <CheckIcon className="h-3.5 w-3.5" />
                    Verified buyer
                  </span>
                )}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default ReviewHighlights;
