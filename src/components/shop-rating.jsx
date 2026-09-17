import Link from "next/link";
import RatingStars from "@/components/ui/rating-stars";
import cn from "@/lib/utils/cn";
import { META } from "@/lib/type";
import { getReviewHighlights } from "@/lib/api/reviews";

const ShopRating = async ({ className }) => {
  let summary;

  try {
    ({ summary } = await getReviewHighlights(0));
  } catch {
    return null;
  }

  if (summary.count === 0) return null;

  return (
    <Link
      href="/reviews"
      className={cn(
        "inline-flex items-center gap-2 transition hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blurple",
        className
      )}
    >
      <RatingStars average={summary.average} showCount={false} />

      <span className={cn(META, "text-ink-soft")}>
        {summary.average} from {summary.count}{" "}
        {summary.count === 1 ? "review" : "reviews"}
      </span>
    </Link>
  );
};

export default ShopRating;
