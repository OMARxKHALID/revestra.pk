import cn from "@/lib/utils/cn";
import { META } from "@/lib/type";

const STARS = [1, 2, 3, 4, 5];

const Star = ({ filled }) => (
  <svg
    viewBox="0 0 20 20"
    aria-hidden="true"
    className={cn("h-3 w-3", filled ? "text-ink-muted" : "text-black/15")}
  >
    <path
      fill="currentColor"
      d="M10 1.6l2.47 5.24 5.53.79-4 4.05.94 5.72L10 14.7l-4.94 2.7.94-5.72-4-4.05 5.53-.79z"
    />
  </svg>
);

const RatingStars = ({ average, count, className, showCount = true }) => {
  if (average === null || average === undefined) return null;

  return (
    <span className={cn("flex items-center gap-2", className)}>
      <span className="flex items-center gap-0.5">
        {STARS.map((star) => (
          <Star key={star} filled={star <= Math.round(average)} />
        ))}
      </span>

      <span className="sr-only">
        {average} out of 5{count === undefined ? "" : `, ${count} reviews`}
      </span>

      {showCount && count !== undefined && (
        <span className={cn(META, "text-ink-soft")} aria-hidden="true">
          {count}
        </span>
      )}
    </span>
  );
};

export default RatingStars;
