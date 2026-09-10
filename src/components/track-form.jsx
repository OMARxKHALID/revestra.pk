"use client";

import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { orderLookupSchema } from "@/lib/schemas/order";
import Field from "@/components/ui/field";
import { HashIcon, MailIcon } from "@/components/ui/icons";
import PillButton from "@/components/ui/pill-button";
import ErrorNotice from "@/components/ui/error-notice";
import OrderStatus from "@/components/order-status";
import OrderSummary from "@/components/order-summary";
import cn from "@/lib/utils/cn";
import { request } from "@/lib/api-client";

const TrackForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(orderLookupSchema) });

  const lookup = useMutation({
    mutationFn: (values) => request("/api/orders/lookup", { body: values }),
  });

  const order = lookup.data ?? null;
  const submitError = lookup.isError ? lookup.error.message : null;
  const handleLookup = (values) => lookup.mutate(values);

  return (
    <div className="mt-10">
      <form onSubmit={handleSubmit(handleLookup)} noValidate>
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
          <Field
            id="reference"
            label="Order reference"
            icon={<HashIcon className="h-4 w-4" />}
            placeholder="CP-XXXXXX-XXXX"
            registration={register("reference")}
            error={errors.reference?.message}
          />
          <Field
            id="email"
            label="Email"
            icon={<MailIcon className="h-4 w-4" />}
            type="email"
            autoComplete="email"
            registration={register("email")}
            error={errors.email?.message}
          />
        </div>

        <PillButton type="submit" disabled={lookup.isPending} className="mt-9">
          {lookup.isPending ? "Looking…" : "Find my order"}
        </PillButton>

        <ErrorNotice error={lookup.error} className="mt-4" />
      </form>

      {order && (
        <div className="mt-12 border-t border-rule pt-10">
          <p className={cn(META, "text-ink-soft")}>{order.reference}</p>

          <OrderStatus status={order.status} />

          <div className="mt-10 max-w-[460px]">
            <OrderSummary items={order.items} totals={order.totals} promo={null} />
          </div>

          <PillButton
            href={`/orders/${order.reference}?t=${encodeURIComponent(order.token)}`}
            className="mt-10"
          >
            Full order details
          </PillButton>
        </div>
      )}
    </div>
  );
};

export default TrackForm;
