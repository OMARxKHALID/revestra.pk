export const promoProblem = (promo, subtotalCents, now = new Date()) => {
  if (!promo) return "That code is not valid";
  if (!promo.active) return "That code is no longer active";

  const at = now instanceof Date ? now : new Date(now);

  if (promo.startsAt && new Date(promo.startsAt) > at)
    return "That code is not active yet";

  if (promo.endsAt && new Date(promo.endsAt) < at) return "That code has expired";

  if (
    promo.maxRedemptions !== null &&
    promo.redemptions >= promo.maxRedemptions
  )
    return "That code has been fully redeemed";

  if (subtotalCents < promo.minSubtotalCents) return "Your cart is too small for that code";

  return null;
};
