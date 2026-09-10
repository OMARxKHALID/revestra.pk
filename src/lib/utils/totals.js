import { DEFAULT_COMMERCE, rateById } from "@/lib/shipping";

export const discountFor = (promo, subtotalCents) => {
  if (!promo) return 0;
  if (promo.kind === "percent")
    return Math.min(
      subtotalCents,
      Math.round((subtotalCents * promo.value) / 100)
    );
  if (promo.kind === "fixed") return Math.min(subtotalCents, promo.value);

  return 0;
};

export const shippingFor = (
  promo,
  afterDiscountCents,
  rateId,
  commerce = DEFAULT_COMMERCE
) => {
  if (afterDiscountCents === 0) return 0;
  if (promo?.kind === "free_shipping") return 0;
  if (afterDiscountCents >= commerce.freeShippingThresholdCents) return 0;

  return rateById(rateId, commerce).cents;
};

export const buildTotals = (input = {}) => {
  const {
    subtotalCents = 0,
    promo = null,
    rateId,
    commerce = DEFAULT_COMMERCE,
  } = input;
  const discountCents = discountFor(promo, subtotalCents);
  const afterDiscount = subtotalCents - discountCents;
  const shippingCents = shippingFor(promo, afterDiscount, rateId, commerce);
  const taxCents = Math.round(afterDiscount * commerce.taxRate);

  return {
    subtotalCents,
    discountCents,
    shippingCents,
    taxCents,
    totalCents: afterDiscount + shippingCents + taxCents,
  };
};
