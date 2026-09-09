export const DEMO_ORDERS = [
  {
    reference: "CP-DEMO01-A1B2",
    status: "delivered",
    createdAt: "2026-07-14T09:12:00.000Z",
    payment: { method: "jazzcash", status: "paid" },
    totals: {
      subtotalCents: 1500000,
      discountCents: 150000,
      shippingCents: 0,
      taxCents: 0,
      totalCents: 1350000,
    },
    items: [
      {
        slug: "quality-design-hoodie",
        name: "Quality Design Hoodie",
        size: "L",
        quantity: 1,
        unitCents: 1500000,
      },
    ],
  },
  {
    reference: "CP-DEMO02-C3D4",
    status: "shipped",
    createdAt: "2026-08-29T16:40:00.000Z",
    payment: { method: "cod", status: "not_required" },
    totals: {
      subtotalCents: 895000,
      discountCents: 0,
      shippingCents: 25000,
      taxCents: 0,
      totalCents: 920000,
    },
    items: [
      {
        slug: "company-candle",
        name: "Company Candle",
        size: null,
        quantity: 1,
        unitCents: 1035000,
      },
      {
        slug: "sticker-pack",
        name: "Sticker Pack",
        size: null,
        quantity: 2,
        unitCents: 125000,
      },
    ],
  },
];
