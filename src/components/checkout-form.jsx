"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import useCart, { selectSubtotal } from "@/store/use-cart";
import { PAYMENT_METHOD, shippingSchema } from "@/lib/schemas/order";
import { CURRENCY, formatPrice } from "@/lib/utils/price";
import { buildTotals } from "@/lib/utils/totals";
import { DEFAULT_COMMERCE, ratesOf } from "@/lib/shipping";
import { codProblem } from "@/lib/utils/cod";
import Field from "@/components/ui/field";
import cn from "@/lib/utils/cn";
import { BODY, EYEBROW, HEADING, META, TITLE } from "@/lib/type";
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
import ErrorNotice from "@/components/ui/error-notice";
import { request, ApiError } from "@/lib/api-client";
import keys from "@/lib/query-keys";
import { track, viewerId } from "@/lib/track";
import {
  ANALYTICS_EVENT,
  majorUnits,
  productProperties,
} from "@/lib/analytics";

const fetchMethods = ({ signal }) => request("/api/payments/methods", { signal });

const FALLBACK_METHODS = [
  {
    id: PAYMENT_METHOD.cod,
    label: "Cash on delivery",
    note: "Pay the courier",
    available: true,
  },
];

const CheckoutForm = ({ commerce = DEFAULT_COMMERCE }) => {
  const rates = ratesOf(commerce);
  const queryClient = useQueryClient();
  const items = useCart((state) => state.items);
  const subtotal = useCart(selectSubtotal);
  const clear = useCart((state) => state.clear);
  const [confirmation, setConfirmation] = useState(null);
  const [rateId, setRateId] = useState(rates[0].id);
  const [chosenMethod, setMethod] = useState(PAYMENT_METHOD.cod);
  const [promo, setPromo] = useState(null);

  const { data, isPending: methodsLoading, isError: methodsFailed } = useQuery({
    queryKey: keys.payments.methods(),
    queryFn: fetchMethods,
    staleTime: 5 * 60 * 1000,
  });

  const totals = buildTotals({
    subtotalCents: subtotal,
    promo,
    rateId,
    commerce,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({ resolver: zodResolver(shippingSchema) });
  const city = useWatch({ control, name: "city" });

  const codBlocked = codProblem({
    commerce,
    totalCents: totals.totalCents,
    city,
  });
  const methods = (
    data?.methods ?? (methodsFailed ? FALLBACK_METHODS : [])
  ).filter((option) => option.available);
  const selectable = methods.filter(
    ({ id }) => !(id === PAYMENT_METHOD.cod && codBlocked)
  );
  const method = selectable.some(({ id }) => id === chosenMethod)
    ? chosenMethod
    : (selectable[0]?.id ?? null);
  const cannotPay = !methodsLoading && !method;

  const started = useRef(false);

  useEffect(() => {
    if (started.current || items.length === 0) return;

    started.current = true;

    track(ANALYTICS_EVENT.checkoutStarted, {
      value: majorUnits(totals.totalCents),
      revenue: majorUnits(totals.totalCents),
      shipping: majorUnits(totals.shippingCents),
      tax: majorUnits(totals.taxCents),
      discount: majorUnits(totals.discountCents),
      coupon: promo?.code ?? null,
      currency: CURRENCY,
      products: items.map(productProperties),
    });
  }, [items, totals, promo]);

  const placeOrder = useMutation({
    mutationFn: (shipping) =>
      request("/api/orders", {
        body: {
          shipping,
          rateId,
          method,
          promoCode: promo?.code ?? "",
          items: items.map(({ slug }) => ({ slug })),
          distinctId: viewerId(),
        },
      }),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: keys.products.all });
      queryClient.invalidateQueries({ queryKey: keys.stock.all });

      if (order.payUrl) {
        window.location.assign(order.payUrl);
        return;
      }

      setConfirmation(order);
      clear();
    },
  });

  const submitError = placeOrder.isError
    ? placeOrder.error instanceof ApiError
      ? placeOrder.error.message
      : "Network error. Try again."
    : null;

  const handleApplyPromo = (applied) => setPromo(applied);
  const handleClearPromo = () => setPromo(null);
  const handleRate = (id) => setRateId(id);
  const handleMethod = (id) => {
    setMethod(id);
    placeOrder.reset();
    track(ANALYTICS_EVENT.paymentInfoEntered, { payment_method: id });
  };

  const handlePlaceOrder = (shipping) => placeOrder.mutate(shipping);

  if (confirmation)
    return (
      <div className="mt-12 border-t border-rule py-16 text-center">
        <p className={cn(EYEBROW, "text-blurple")}>Order received</p>

        <h2 className={cn(HEADING, "mt-4 text-ink")}>
          Thank you — we have it from here.
        </h2>

        <p className={cn(BODY, "mt-4 text-ink-muted")}>
          Your reference is{" "}
          <span className="tracking-[0.08em] tabular-nums text-ink">
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
      <div className="mt-12 border-t border-rule py-16 text-center">
        <p className={cn(TITLE, "text-ink-muted")}>
          There is nothing to check out.
        </p>

        <PillButton href="/products" className="mt-8">
          Browse the store
        </PillButton>
      </div>
    );

  return (
    <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px] lg:gap-20">
      <form
        onSubmit={handleSubmit(handlePlaceOrder)}
        noValidate
        className="order-2 lg:order-1"
      >
        <h2 className={cn(META, "border-b border-rule pb-4 text-ink-muted")}>
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
            "mt-12 border-b border-rule pb-4 text-ink-muted"
          )}
        >
          Delivery
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {rates.map((rate) => (
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

        <p className={cn(META, "mt-3 text-ink-soft")}>
          Free over {formatPrice(commerce.freeShippingThresholdCents)}.
        </p>

        <h2
          className={cn(
            META,
            "mt-12 border-b border-rule pb-4 text-ink-muted"
          )}
        >
          Payment
        </h2>

        {methodsLoading && (
          <p className={cn(META, "mt-6 text-ink-soft")}>
            Checking payment options…
          </p>
        )}

        {cannotPay && (
          <p className={cn(META, "mt-6 text-sale")}>
            {codBlocked && methods.length > 0
              ? `${codBlocked}, and no other payment method is available.`
              : "Checkout is paused right now — no payment method is available. Please try again later."}
          </p>
        )}

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 empty:hidden">
          {methods.map((option) => (
            <OptionTile
              key={option.id}
              icon={
                option.id === PAYMENT_METHOD.cod ? (
                  <BagIcon className="h-4 w-4" />
                ) : (
                  <WalletIcon className="h-4 w-4" />
                )
              }
              label={option.label}
              note={
                option.id === PAYMENT_METHOD.cod && codBlocked
                  ? codBlocked
                  : option.note
              }
              selected={method === option.id}
              disabled={option.id === PAYMENT_METHOD.cod && Boolean(codBlocked)}
              onClick={() => handleMethod(option.id)}
            />
          ))}
        </div>

        <PillButton
          type="submit"
          disabled={placeOrder.isPending || !method}
          className="mt-10 w-full sm:w-auto"
        >
          {placeOrder.isPending
            ? "Placing order…"
            : method === PAYMENT_METHOD.cod
              ? "Place order"
              : `Pay ${formatPrice(totals.totalCents)}`}
        </PillButton>

        <ErrorNotice error={placeOrder.error} className="mt-4" />

        {method && (
          <p className={cn(META, "mt-6 leading-relaxed text-ink-soft")}>
            {method === PAYMENT_METHOD.cod
              ? "Nothing is charged now. Pay the courier when your order arrives."
              : "You are taken to the gateway to pay. Card and wallet details are never entered here."}
          </p>
        )}
      </form>

      <aside className="order-1 lg:sticky lg:top-[calc(var(--spacing-header)+2rem)] lg:order-2 lg:self-start lg:pt-1">
        <h2 className={cn(META, "border-b border-rule pb-4 text-ink-muted")}>
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
