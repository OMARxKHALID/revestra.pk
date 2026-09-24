export const CURRENCY = "PKR";

export const CURRENCY_LOCALE = "en-PK";

const whole = new Intl.NumberFormat(CURRENCY_LOCALE, {
  style: "currency",
  currency: CURRENCY,
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const fractional = new Intl.NumberFormat(CURRENCY_LOCALE, {
  style: "currency",
  currency: CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatPrice = (cents) =>
  (cents % 100 === 0 ? whole : fractional)
    .format(cents / 100)
    .replace(/ /g, " ");
