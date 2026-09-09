import {
  FREE_SHIPPING_THRESHOLD_CENTS,
  TAX_RATE,
  rateById,
} from "@/lib/shipping";

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

export const shippingFor = (promo, afterDiscountCents, rateId) => {
  if (afterDiscountCents === 0) return 0;
  if (promo?.kind === "free_shipping") return 0;
  if (afterDiscountCents >= FREE_SHIPPING_THRESHOLD_CENTS) return 0;

  return rateById(rateId).cents;
};

export const buildTotals = ({ subtotalCents, promo = null, rateId } = {}) => {
  const discountCents = discountFor(promo, subtotalCents);
  const afterDiscount = subtotalCents - discountCents;
  const shippingCents = shippingFor(promo, afterDiscount, rateId);
  const taxCents = Math.round(afterDiscount * TAX_RATE);

  return {
    subtotalCents,
    discountCents,
    shippingCents,
    taxCents,
    totalCents: afterDiscount + shippingCents + taxCents,
  };
};
