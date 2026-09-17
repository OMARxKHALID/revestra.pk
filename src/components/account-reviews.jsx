"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import RatingStars from "@/components/ui/rating-stars";
import PillButton from "@/components/ui/pill-button";
import cn from "@/lib/utils/cn";
import { BODY, META } from "@/lib/type";
import { REVIEW_STATUS } from "@/lib/schemas/review";
import { request } from "@/lib/api-client";

const STATUS_NOTE = {
  [REVIEW_STATUS.pending]: "Waiting to be published",
  [REVIEW_STATUS.published]: "Published",
  [REVIEW_STATUS.hidden]: "Not published",
};

const AccountReviews = ({ reviews }) => {
  const router = useRouter();

  const remove = useMutation({
    mutationFn: (id) => request(`/api/account/reviews/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Review deleted");
      router.refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleDelete = (id) => () => {
    if (window.confirm("Delete this review?")) remove.mutate(id);
  };

  if (reviews.length === 0)
    return (
      <p className={cn(BODY, "mt-10 text-ink-muted")}>
        You have not written a review yet. Every piece you buy can have one.
      </p>
    );

  return (
    <ul className="mt-10 divide-y divide-rule border-y border-rule">
      {reviews.map((review) => (
        <li key={review.id} className="grid gap-3 py-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <RatingStars average={review.rating} showCount={false} />
            <span className={cn(META, "text-ink-soft")}>
              {STATUS_NOTE[review.status] ?? review.status} ·{" "}
              {new Date(review.createdAt).toLocaleDateString("en-PK")}
            </span>
          </div>

          {review.title && <p className={cn(BODY, "text-ink")}>{review.title}</p>}
          <p className={cn(BODY, "text-ink-muted")}>{review.body}</p>

          <div>
            <PillButton
              size="sm"
              onClick={handleDelete(review.id)}
              disabled={remove.isPending}
              className="border-sale text-sale hover:bg-sale"
            >
              Delete
            </PillButton>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default AccountReviews;
