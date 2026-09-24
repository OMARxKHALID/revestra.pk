"use client";

import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newsletterSchema } from "@/lib/schemas/newsletter";
import cn from "@/lib/utils/cn";
import { MailIcon } from "@/components/ui/icons";
import { EYEBROW, META } from "@/lib/type";
import { request } from "@/lib/api-client";

const NewsletterForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(newsletterSchema) });

  const subscribe = useMutation({
    mutationFn: (email) => request("/api/newsletter", { body: { email } }),
    onSuccess: () => reset(),
    onError: (error) =>
      setError("email", {
        message: error.message ?? "Network error. Try again.",
      }),
  });

  const handleSubscribe = ({ email }) => subscribe.mutate(email);

  return (
    <form
      onSubmit={handleSubmit(handleSubscribe)}
      noValidate
      className="w-full sm:max-w-72 sm:text-right"
    >
      <label
        htmlFor="newsletter-email"
        className={cn(META, "text-white/45")}
      >
        Sign up for our Substack
      </label>

      <div className="mt-3 flex items-center gap-2.5 border-b border-white/20 pb-2 focus-within:border-brand-soft">
        <MailIcon className="h-4 w-4 shrink-0 text-white/45" />

        <input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(errors.email)}
          aria-describedby="newsletter-status"
          {...register("email")}
          className="w-full bg-transparent font-sans text-sm text-white placeholder:text-white/30 focus:outline-none"
        />

        <button
          type="submit"
          disabled={subscribe.isPending}
          className={cn(
            EYEBROW,
            "relative shrink-0 text-brand-soft transition before:absolute before:-inset-2 before:content-[''] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:text-white/30"
          )}
        >
          {subscribe.isPending ? "…" : "Join"}
        </button>
      </div>

      <p
        id="newsletter-status"
        aria-live="polite"
        className={cn(
          META,
          "mt-2",
          errors.email ? "text-sale" : "text-brand-soft"
        )}
      >
        {errors.email?.message ??
          (subscribe.isSuccess ? "You are on the list." : " ")}
      </p>
    </form>
  );
};

export default NewsletterForm;
