"use client";

import { useState } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reviewSchema } from "@/lib/schemas/review";
import RatingStars from "@/components/ui/rating-stars";
import {
  CheckIcon,
  MailIcon,
  PenIcon,
  UserIcon,
} from "@/components/ui/icons";
import Field from "@/components/ui/field";
import Chip from "@/components/ui/chip";
import PillButton from "@/components/ui/pill-button";
import ReviewPhotos from "@/components/review-photos";
import ErrorNotice from "@/components/ui/error-notice";
import cn from "@/lib/utils/cn";
import { BODY, HEADING, META, TITLE } from "@/lib/type";
import { request } from "@/lib/api-client";
import keys from "@/lib/query-keys";
import { track } from "@/lib/track";
import { ANALYTICS_EVENT } from "@/lib/analytics";

const RATINGS = [5, 4, 3, 2, 1];

const fetchReviews = ({ signal }) => request("/api/reviews", { signal });

const StoreReviews = ({ initialReviews, initialSummary }) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [photos, setPhotos] = useState([]);

  const { data } = useQuery({
    queryKey: keys.reviews.list(),
    queryFn: fetchReviews,
    initialData: { reviews: initialReviews, summary: initialSummary },
    staleTime: 60_000,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reviewSchema.omit({ rating: true })),
  });

  const postReview = useMutation({
    mutationFn: (values) =>
      request("/api/reviews", { body: { ...values, rating, images: photos } }),
    onSuccess: () => {
      reset();
      setPhotos([]);
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: keys.reviews.all });
      track(ANALYTICS_EVENT.productReviewed, { rating });
    },
  });

  const submitError = postReview.isError ? postReview.error.message : null;

  const handleOpen = () => setOpen(true);
  const handleRating = (value) => setRating(value);
  const handlePostReview = (values) => postReview.mutate(values);

  return (
    <section>
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className={cn(HEADING, "text-ink")}>
            {data.summary.count === 0
              ? "No reviews yet"
              : `${data.summary.count} review${data.summary.count === 1 ? "" : "s"}`}
          </h2>

          {data.summary.average !== null && (
            <RatingStars
              average={data.summary.average}
              count={data.summary.count}
            />
          )}
        </div>

        <ul className="mt-10 divide-y divide-rule border-t border-rule">
          {data.reviews.map((review) => (
            <li key={review.id ?? `${review.author}-${review.createdAt}`} className="py-7">
              <div className="flex flex-wrap items-center gap-3">
                <RatingStars average={review.rating} showCount={false} />

                <p className={cn(META, "flex items-center gap-1.5 text-ink-soft")}>
                  {review.author}

                  {review.verified && (
                    <span className="flex items-center gap-1 text-blurple">
                      <CheckIcon className="h-3.5 w-3.5" />
                      verified buyer
                    </span>
                  )}
                </p>
              </div>

              <p className={cn(TITLE, "mt-3 text-ink")}>
                {review.title}
              </p>

              <p className={cn(BODY, "mt-2 max-w-[62ch] text-ink-muted")}>
                {review.body}
              </p>

              {review.images?.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-3">
                  {review.images.map((id) => (
                    <li key={id}>
                      <Image
                        src={`/api/reviews/image/${id}`}
                        alt={`Photo from ${review.author}`}
                        width={112}
                        height={112}
                        unoptimized
                        className="h-28 w-28 rounded object-cover"
                      />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        {!open && (
          <PillButton onClick={handleOpen} className="mt-10">
            Write a review
          </PillButton>
        )}

        {open && (
          <form onSubmit={handleSubmit(handlePostReview)} noValidate className="mt-12">
            <h3
              className={cn(META, "border-b border-rule pb-4 text-ink-muted")}
            >
              Your review
            </h3>

            <fieldset className="mt-7">
              <legend className={cn(META, "text-ink-soft")}>Your rating</legend>

              <div className="mt-3 flex flex-wrap gap-2">
                {RATINGS.map((value) => (
                  <Chip
                    key={value}
                    selected={rating === value}
                    onClick={() => handleRating(value)}
                    aria-label={`${value} out of 5`}
                    className="min-w-[52px]"
                  >
                    {value}
                    <span aria-hidden="true"> ★</span>
                  </Chip>
                ))}
              </div>
            </fieldset>

            <div className="mt-8 grid grid-cols-1 gap-7 sm:grid-cols-2">
              <Field
                id="author"
                label="Name"
                icon={<UserIcon className="h-4 w-4" />}
                registration={register("author")}
                error={errors.author?.message}
              />
              <Field
                id="review-email"
                label="Email"
                icon={<MailIcon className="h-4 w-4" />}
                type="email"
                registration={register("email")}
                error={errors.email?.message}
              />
              <Field
                id="title"
                label="Headline"
                icon={<PenIcon className="h-4 w-4" />}
                className="sm:col-span-2"
                registration={register("title")}
                error={errors.title?.message}
              />
              <Field
                id="body"
                label="Your review"
                className="sm:col-span-2"
                registration={register("body")}
                error={errors.body?.message}
              />
            </div>

            <div className="mt-8">
              <ReviewPhotos value={photos} onChange={setPhotos} />
            </div>

            <PillButton type="submit" disabled={postReview.isPending} className="mt-9">
              {postReview.isPending ? "Posting…" : "Post review"}
            </PillButton>

            <ErrorNotice error={postReview.error} className="mt-4" />
          </form>
        )}
      </div>
    </section>
  );
};

export default StoreReviews;
