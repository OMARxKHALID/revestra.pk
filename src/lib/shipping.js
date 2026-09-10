export const SHIPPING_RATE_IDS = ["standard", "express"];

export const DEFAULT_SHIPPING_RATES = [
  {
    id: "standard",
    label: "Standard",
    note: "3–5 working days, nationwide",
    cents: 25000,
  },
  {
    id: "express",
    label: "Express",
    note: "1–2 working days, major cities",
    cents: 45000,
  },
];

export const DEFAULT_COMMERCE = {
  freeShippingThresholdCents: 500000,
  taxRate: 0,
  holdMinutes: 15,
  shippingRates: DEFAULT_SHIPPING_RATES,
};

export const ratesOf = (commerce) =>
  commerce?.shippingRates?.length
    ? commerce.shippingRates
    : DEFAULT_SHIPPING_RATES;

export const defaultRate = (commerce = DEFAULT_COMMERCE) => ratesOf(commerce)[0];

export const rateById = (id, commerce = DEFAULT_COMMERCE) =>
  ratesOf(commerce).find((rate) => rate.id === id) ?? defaultRate(commerce);
