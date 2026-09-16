import {
  ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
} from "@/lib/schemas/order";

export const DEMO_ORDERS = [
  {
    reference: "RV-DEMO01-A1B2",
    status: ORDER_STATUS.delivered,
    createdAt: "2026-07-14T09:12:00.000Z",
    payment: { method: PAYMENT_METHOD.jazzcash, status: PAYMENT_STATUS.paid },
    totals: {
      subtotalCents: 1290000,
      discountCents: 129000,
      shippingCents: 0,
      taxCents: 0,
      totalCents: 1161000,
    },
    items: [
      {
        slug: "carhartt-duck-jacket-l",
        sku: "RV-0201",
        name: "Carhartt Duck Chore Jacket",
        size: "L",
        condition: "Good",
        quantity: 1,
        unitCents: 1290000,
      },
    ],
  },
  {
    reference: "RV-DEMO02-C3D4",
    status: ORDER_STATUS.shipped,
    createdAt: "2026-08-29T16:40:00.000Z",
    payment: {
      method: PAYMENT_METHOD.cod,
      status: PAYMENT_STATUS.notRequired,
    },
    totals: {
      subtotalCents: 610000,
      discountCents: 0,
      shippingCents: 25000,
      taxCents: 0,
      totalCents: 635000,
    },
    items: [
      {
        slug: "ralph-lauren-oxford-shirt-m",
        sku: "RV-0301",
        name: "Ralph Lauren Oxford Shirt",
        size: "M",
        condition: "Excellent",
        quantity: 1,
        unitCents: 420000,
      },
      {
        slug: "brown-leather-belt-34",
        sku: "RV-0501",
        name: "Brown Leather Belt",
        size: '34"',
        condition: "Good",
        quantity: 1,
        unitCents: 180000,
      },
    ],
  },
];
