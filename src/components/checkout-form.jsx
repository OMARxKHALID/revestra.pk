"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import useCart, { selectSubtotal } from "@/store/use-cart";
import { shippingSchema } from "@/lib/schemas/order";
import { formatPrice } from "@/lib/utils/price";
import { buildTotals } from "@/lib/utils/totals";
import { FREE_SHIPPING_THRESHOLD_CENTS, SHIPPING_RATES } from "@/lib/shipping";
import Field from "@/components/ui/field";
import cn from "@/lib/utils/cn";
import { BODY, EYEBROW, HEADING, META, NOTICE, TITLE } from "@/lib/type";
import PillButton from "@/components/ui/pill-button";
import OptionTile from "@/components/ui/option-tile";
import {
  BagIcon,
  BuildingIcon,
  GlobeIcon,
  HashIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
  TruckIcon,
  UserIcon,
  WalletIcon,
} from "@/components/ui/icons";
import PromoField from "@/components/promo-field";
import OrderSummary from "@/components/order-summary";

const fetchMethods = async () => {
  const response = await fetch("/api/payments/methods");

  if (!response.ok) throw new Error("Could not load payment methods");

  return response.json();
};

const FALLBACK_METHODS = [
  { id: "cod", label: "Cash on delivery", note: "Pay the courier", available: true },
];

const CheckoutForm = () => {
  const items = useCart((state) => state.items);
  const subtotal = useCart(selectSubtotal);
  const clear = useCart((state) => state.clear);
  const [confirmation, setConfirmation] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [rateId, setRateId] = useState(SHIPPING_RATES[0].id);
  const [method, setMethod] = useState("cod");
  const [promo, setPromo] = useState(null);

  const { data } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: fetchMethods,
    staleTime: 5 * 60 * 1000,
  });

  const methods = data?.methods ?? FALLBACK_METHODS;
  const totals = buildTotals({ subtotalCents: subtotal, promo, rateId });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(shippingSchema) });

  const handleApplyPromo = (applied) => setPromo(applied);
  const handleClearPromo = () => setPromo(null);
  const handleRate = (id) => setRateId(id);
  const handleMethod = (id) => {
    setMethod(id);
    setSubmitError(null);
  };

  const onSubmit = async (shipping) => {
    setSubmitError(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipping,
          rateId,
          method,
          promoCode: promo?.code ?? "",
          items: items.map(({ slug }) => ({ slug })),
        }),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        setSubmitError(body.error ?? "Could not place the order. Try again.");
        return;
      }

      if (body.payUrl) {
        clear();
        window.location.assign(body.payUrl);
        return;
      }

      setConfirmation(body);
      clear();
    } catch {
      setSubmitError("Network error. Try again.");
    }
  };

  if (confirmation)
    return (
      <div className="mt-12 border-t border-black/10 py-16 text-center">
        <p className={cn(EYEBROW, "text-blurple")}>Order received</p>

        <h2 className={cn(HEADING, "mt-4 text-black")}>
          Thank you — we have it from here.
        </h2>

        <p className={cn(BODY, "mt-4 text-black/70")}>
          Your reference is{" "}
          <span className="tracking-[0.08em] tabular-nums text-black">
            {confirmation.reference}
          </span>
          . Pay the courier {formatPrice(confirmation.totals.totalCents)} on
          delivery.
        </p>

        {confirmation.persisted === false && (
          <p className={cn(META, "mt-4 text-sale")}>
            Demo mode — no database is configured, so this order was not stored.
          </p>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {confirmation.persisted && (
            <PillButton
              href={`/orders/${confirmation.reference}?t=${encodeURIComponent(
                confirmation.token
              )}`}
            >
              Track this order
            </PillButton>
          )}

          <PillButton href="/products">Keep shopping</PillButton>
        </div>
      </div>
    );

  if (items.length === 0)
    return (
      <div className="mt-12 border-t border-black/10 py-16 text-center">
        <p className={cn(TITLE, "text-black/70")}>
          There is nothing to check out.
        </p>

        <PillButton href="/products" className="mt-8">
          Browse the store
        </PillButton>
      </div>
    );

  return (
    <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px] lg:gap-20">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="order-2 lg:order-1">
        <h2 className={cn(META, "border-b border-black/10 pb-4 text-black/70")}>
          Shipping details
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-7 sm:grid-cols-2">
          <Field
            id="name"
            label="Full name"
            icon={<UserIcon className="h-4 w-4" />}
            autoComplete="name"
            className="sm:col-span-2"
            registration={register("name")}
            error={errors.name?.message}
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
          <Field
            id="phone"
            label="Mobile number"
            icon={<PhoneIcon className="h-4 w-4" />}
            type="tel"
            autoComplete="tel"
            placeholder="0300 1234567"
            registration={register("phone")}
            error={errors.phone?.message}
          />
          <Field
            id="address"
            label="Street address"
            icon={<PinIcon className="h-4 w-4" />}
            autoComplete="address-line1"
            className="sm:col-span-2"
            registration={register("address")}
            error={errors.address?.message}
          />
          <Field
            id="apartment"
            label="Apartment (optional)"
            icon={<BuildingIcon className="h-4 w-4" />}
            autoComplete="address-line2"
            className="sm:col-span-2"
            registration={register("apartment")}
            error={errors.apartment?.message}
          />
          <Field
            id="city"
            label="City"
            icon={<PinIcon className="h-4 w-4" />}
            autoComplete="address-level2"
            registration={register("city")}
            error={errors.city?.message}
          />
          <Field
            id="postalCode"
            label="Postal code"
            icon={<HashIcon className="h-4 w-4" />}
            autoComplete="postal-code"
            registration={register("postalCode")}
            error={errors.postalCode?.message}
          />
          <Field
            id="country"
            label="Country"
            icon={<GlobeIcon className="h-4 w-4" />}
            autoComplete="country-name"
            defaultValue="Pakistan"
            className="sm:col-span-2"
            registration={register("country")}
            error={errors.country?.message}
          />
        </div>

        <h2
          className={cn(
            META,
            "mt-12 border-b border-black/10 pb-4 text-black/70"
          )}
        >
          Delivery
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SHIPPING_RATES.map((rate) => (
            <OptionTile
              key={rate.id}
              icon={<TruckIcon className="h-4 w-4" />}
              label={`${rate.label} · ${formatPrice(rate.cents)}`}
              note={rate.note}
              selected={rateId === rate.id}
              onClick={() => handleRate(rate.id)}
            />
          ))}
        </div>

        <p className={cn(META, "mt-3 text-black/45")}>
          Free over {formatPrice(FREE_SHIPPING_THRESHOLD_CENTS)}.
        </p>

        <h2
          className={cn(
            META,
            "mt-12 border-b border-black/10 pb-4 text-black/70"
          )}
        >
          Payment
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {methods.map((option) => (
            <OptionTile
              key={option.id}
              icon={
                option.id === "cod" ? (
                  <BagIcon className="h-4 w-4" />
                ) : (
                  <WalletIcon className="h-4 w-4" />
                )
              }
              label={option.label}
              note={option.available ? option.note : "Unavailable"}
              selected={method === option.id}
              disabled={!option.available}
              onClick={() => handleMethod(option.id)}
            />
          ))}
        </div>

        <PillButton
          type="submit"
          disabled={isSubmitting}
          className="mt-10 w-full sm:w-auto"
        >
          {isSubmitting
            ? "Placing order…"
            : method === "cod"
              ? "Place order"
              : `Pay ${formatPrice(totals.totalCents)}`}
        </PillButton>

        <p aria-live="polite" className={cn(NOTICE, "mt-4 text-sale")}>
          {submitError ?? ""}
        </p>

        <p className={cn(META, "mt-6 leading-relaxed text-black/45")}>
          {method === "cod"
            ? "Nothing is charged now. Pay the courier when your order arrives."
            : "You are taken to the gateway to pay. Card and wallet details are never entered here."}
        </p>
      </form>

      <aside className="order-1 lg:sticky lg:top-[calc(var(--spacing-header)+2rem)] lg:order-2 lg:self-start lg:pt-1">
        <h2 className={cn(META, "border-b border-black/10 pb-4 text-black/70")}>
          Order summary
        </h2>

        <OrderSummary items={items} totals={totals} promo={promo} />

        <PromoField
          subtotalCents={subtotal}
          rateId={rateId}
          promo={promo}
          onApply={handleApplyPromo}
          onClear={handleClearPromo}
        />
      </aside>
    </div>
  );
};

export default CheckoutForm;
