"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Field from "@/components/ui/field";
import { HashIcon, MailIcon } from "@/components/ui/icons";
import PillButton from "@/components/ui/pill-button";
import OrderStatus from "@/components/order-status";
import OrderSummary from "@/components/order-summary";
import cn from "@/lib/utils/cn";
import { NOTICE } from "@/lib/type";

const trackSchema = z.object({
  reference: z.string().trim().min(4, "Enter your order reference"),
  email: z.email("Enter the email you ordered with"),
});

const TrackForm = () => {
  const [order, setOrder] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(trackSchema) });

  const onSubmit = async (values) => {
    setSubmitError(null);
    setOrder(null);

    try {
      const response = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        setSubmitError(body.error ?? "Could not find that order.");
        return;
      }

      setOrder(body);
    } catch {
      setSubmitError("Network error. Try again.");
    }
  };

  return (
    <div className="mt-10">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
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

        <PillButton type="submit" disabled={isSubmitting} className="mt-9">
          {isSubmitting ? "Looking…" : "Find my order"}
        </PillButton>

        <p aria-live="polite" className={cn(NOTICE, "mt-4 text-sale")}>
          {submitError ?? " "}
        </p>
      </form>

      {order && (
        <div className="mt-12 border-t border-black/10 pt-10">
          <p className={cn(META, "text-black/45")}>{order.reference}</p>

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
