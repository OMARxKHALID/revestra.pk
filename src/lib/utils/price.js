const whole = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const fractional = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatPrice = (cents) =>
  (cents % 100 === 0 ? whole : fractional)
    .format(cents / 100)
    .replace(/ /g, " ");

export const sumCents = (items) =>
  items.reduce((total, item) => total + item.unitCents, 0);
