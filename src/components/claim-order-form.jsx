"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Field from "@/components/ui/field";
import { HashIcon, MailIcon } from "@/components/ui/icons";
import PillButton from "@/components/ui/pill-button";
import cn from "@/lib/utils/cn";
import { META, NOTICE } from "@/lib/type";

const claimSchema = z.object({
  reference: z.string().trim().min(4, "Enter the order reference"),
  email: z.email("Enter the email you ordered with"),
});

const ClaimOrderForm = () => {
  const router = useRouter();
  const [message, setMessage] = useState(null);
  const [failed, setFailed] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(claimSchema) });

  const onSubmit = async (values) => {
    setMessage(null);
    setFailed(false);

    try {
      const response = await fetch("/api/orders/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        setFailed(true);
        setMessage(body.error ?? "Could not add that order.");
        return;
      }

      setMessage(`${body.reference} added to your account.`);
      reset();
      router.refresh();
    } catch {
      setFailed(true);
      setMessage("Network error. Try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-14">
      <h2 className={cn(META, "border-b border-black/10 pb-4 text-black/70")}>
        Add an order you placed as a guest
      </h2>

      <div className="mt-7 grid grid-cols-1 gap-7 sm:grid-cols-2">
        <Field
          id="claim-reference"
          label="Order reference"
          icon={<HashIcon className="h-4 w-4" />}
          registration={register("reference")}
          error={errors.reference?.message}
        />
        <Field
          id="claim-email"
          label="Email used"
          icon={<MailIcon className="h-4 w-4" />}
          type="email"
          registration={register("email")}
          error={errors.email?.message}
        />
      </div>

      <PillButton
        type="submit"
        size="sm"
        disabled={isSubmitting}
        className="mt-7"
      >
        {isSubmitting ? "Adding…" : "Add order"}
      </PillButton>

      <p
        aria-live="polite"
        className={cn(NOTICE, "mt-4", failed ? "text-sale" : "text-blurple")}
      >
        {message ?? " "}
      </p>
    </form>
  );
};

export default ClaimOrderForm;
