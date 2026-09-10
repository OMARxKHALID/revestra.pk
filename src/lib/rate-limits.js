const TEN_MINUTES = 10 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

const RATE_LIMITS = {
  signIn: { limit: 10, windowMs: TEN_MINUTES },
  register: { limit: 5, windowMs: ONE_HOUR },
  passwordResetRequest: { limit: 5, windowMs: ONE_HOUR },
  passwordResetConfirm: { limit: 10, windowMs: ONE_HOUR },
  newsletter: { limit: 5, windowMs: ONE_HOUR },
  review: { limit: 5, windowMs: ONE_HOUR },
  promo: { limit: 20, windowMs: TEN_MINUTES },
  order: { limit: 10, windowMs: TEN_MINUTES },
  orderLookup: { limit: 10, windowMs: TEN_MINUTES },
  orderClaim: { limit: 10, windowMs: TEN_MINUTES },
  orderCancel: { limit: 10, windowMs: TEN_MINUTES },
  wishlist: { limit: 60, windowMs: TEN_MINUTES },
};

export default RATE_LIMITS;
