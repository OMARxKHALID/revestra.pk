import { describe, expect, test } from "bun:test";
import { buildSalesReport } from "../src/lib/utils/sales-report.js";

const products = new Map([
  ["jeans-1", { slug: "jeans-1", category: "Jeans", brand: "Levi's", costCents: 90000 }],
  ["jacket-1", { slug: "jacket-1", category: "Jackets", brand: "Carhartt", costCents: 150000 }],
  ["tee-1", { slug: "tee-1", category: "Shirts", brand: "Unbranded" }],
]);

const orders = [
  {
    createdAt: "2026-08-10T10:00:00Z",
    totals: { totalCents: 500000, discountCents: 20000, shippingCents: 25000 },
    items: [{ slug: "jeans-1", unitCents: 480000 }],
  },
  {
    createdAt: "2026-09-02T10:00:00Z",
    totals: { totalCents: 1000000, discountCents: 0, shippingCents: 0 },
    items: [
      { slug: "jacket-1", unitCents: 850000 },
      { slug: "tee-1", unitCents: 140000 },
    ],
  },
];

describe("sales report", () => {
  const report = buildSalesReport({ orders, products });

  test("totals and averages come from the orders", () => {
    expect(report.orders).toBe(2);
    expect(report.revenueCents).toBe(1500000);
    expect(report.averageOrderCents).toBe(750000);
    expect(report.discountCents).toBe(20000);
    expect(report.shippingCents).toBe(25000);
    expect(report.itemsSold).toBe(3);
  });

  test("margin uses piece costs and flags pieces without one", () => {
    expect(report.costCents).toBe(240000);
    expect(report.marginCents).toBe(1470000 - 240000);
    expect(report.itemsWithoutCost).toBe(1);
    expect(report.marginPercent).toBeCloseTo(83.7, 1);
  });

  test("months are ordered oldest first", () => {
    expect(report.months.map(({ month }) => month)).toEqual(["2026-08", "2026-09"]);
    expect(report.months[1].revenueCents).toBe(1000000);
  });

  test("categories and brands rank by revenue, unknown pieces included", () => {
    expect(report.categories.map(({ name }) => name)).toEqual(["Jackets", "Jeans", "Shirts"]);
    expect(report.brands[0]).toMatchObject({ name: "Carhartt", itemsSold: 1 });
  });

  test("an empty range answers with zeros, not errors", () => {
    const empty = buildSalesReport({});

    expect(empty.orders).toBe(0);
    expect(empty.averageOrderCents).toBe(0);
    expect(empty.marginPercent).toBe(0);
    expect(empty.months).toEqual([]);
  });

  test("a piece that was deleted still counts under Unknown", () => {
    const report = buildSalesReport({
      orders: [
        {
          createdAt: "2026-09-02T10:00:00Z",
          totals: { totalCents: 1000 },
          items: [{ slug: "gone", unitCents: 1000 }],
        },
      ],
      products,
    });

    expect(report.categories[0].name).toBe("Unknown");
    expect(report.itemsWithoutCost).toBe(1);
  });
});
