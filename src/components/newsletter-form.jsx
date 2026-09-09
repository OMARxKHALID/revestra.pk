"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newsletterSchema } from "@/lib/schemas/newsletter";
import cn from "@/lib/utils/cn";
import { MailIcon } from "@/components/ui/icons";
import { EYEBROW, META } from "@/lib/type";

const NewsletterForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm({ resolver: zodResolver(newsletterSchema) });

  const onSubmit = async ({ email }) => {
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const { error } = await response.json().catch(() => ({}));
        setError("email", {
          message: error ?? "Something went wrong. Try again.",
        });
        return;
      }

      reset();
    } catch {
      setError("email", { message: "Network error. Try again." });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="w-full sm:max-w-72 sm:text-right"
    >
      <label
        htmlFor="newsletter-email"
        className={cn(META, "text-white/45")}
      >
        Sign up for our Substack
      </label>

      <div className="mt-3 flex items-center gap-2.5 border-b border-white/20 pb-2 focus-within:border-blurple">
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
          disabled={isSubmitting}
          className={cn(
            EYEBROW,
            "relative shrink-0 text-blurple transition before:absolute before:-inset-2 before:content-[''] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:text-white/30"
          )}
        >
          {isSubmitting ? "…" : "Join"}
        </button>
      </div>

      <p
        id="newsletter-status"
        aria-live="polite"
        className={cn(
          META,
          "mt-2",
          errors.email ? "text-sale" : "text-blurple"
        )}
      >
        {errors.email?.message ??
          (isSubmitSuccessful ? "You are on the list." : " ")}
      </p>
    </form>
  );
};

export default NewsletterForm;
