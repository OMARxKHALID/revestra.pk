"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { orderLookupSchema } from "@/lib/schemas/order";
import Field from "@/components/ui/field";
import { HashIcon, MailIcon } from "@/components/ui/icons";
import PillButton from "@/components/ui/pill-button";
import cn from "@/lib/utils/cn";
import { META, NOTICE } from "@/lib/type";
import { request } from "@/lib/api-client";

const ClaimOrderForm = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(orderLookupSchema) });

  const claim = useMutation({
    mutationFn: (values) => request("/api/orders/claim", { body: values }),
    onSuccess: () => {
      reset();
      router.refresh();
    },
  });

  const failed = claim.isError;
  const message = claim.isError
    ? claim.error.message
    : claim.isSuccess
      ? `${claim.data.reference} added to your account.`
      : null;

  const handleClaim = (values) => claim.mutate(values);

  return (
    <form onSubmit={handleSubmit(handleClaim)} noValidate className="mt-14">
      <h2 className={cn(META, "border-b border-rule pb-4 text-ink-muted")}>
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
        disabled={claim.isPending}
        className="mt-7"
      >
        {claim.isPending ? "Adding…" : "Add order"}
      </PillButton>

      <p
        aria-live="polite"
        className={cn(NOTICE, "mt-4", failed ? "text-sale" : "text-brand")}
      >
        {message ?? " "}
      </p>
    </form>
  );
};

export default ClaimOrderForm;
