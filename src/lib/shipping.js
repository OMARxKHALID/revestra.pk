export const FREE_SHIPPING_THRESHOLD_CENTS = 500000;

export const SHIPPING_RATES = [
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

export const TAX_RATE = 0.0;

export const defaultRate = () => SHIPPING_RATES[0];

export const rateById = (id) =>
  SHIPPING_RATES.find((rate) => rate.id === id) ?? defaultRate();
