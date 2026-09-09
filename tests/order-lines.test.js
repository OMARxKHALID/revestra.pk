import { describe, expect, test } from "bun:test";
import { priceOrderLines, subtotalOf } from "../src/lib/utils/order-lines.js";

const catalogue = [
  {
    slug: "levis-501-straight-w32-l30",
    sku: "GS-0101",
    name: "Levi's 501 Straight",
    image: "/assets/WEBP/jeans.webp",
    sizeLabel: "W32 L30",
    condition: "Good",
    priceCents: 480000,
    salePriceCents: 420000,
    status: "available",
    reservedUntil: null,
  },
  {
    slug: "carhartt-duck-jacket-l",
    sku: "GS-0201",
    name: "Carhartt Duck Chore Jacket",
    image: "/assets/WEBP/jacket.webp",
    sizeLabel: "L",
    condition: "Good",
    priceCents: 1450000,
    salePriceCents: null,
    status: "sold",
    reservedUntil: null,
  },
  {
    slug: "levis-trucker-jacket-m",
    sku: "GS-0202",
    name: "Levi's Trucker Jacket",
    image: "/assets/WEBP/trucker.webp",
    sizeLabel: "M",
    condition: "Excellent",
    priceCents: 1180000,
    salePriceCents: null,
    status: "reserved",
    reservedUntil: new Date(Date.now() + 600_000).toISOString(),
  },
];

const line = (slug) => ({ slug, name: "whatever", unitCents: 1, quantity: 9 });

describe("priceOrderLines", () => {
  test("prices from the catalogue, never from the client", () => {
    const result = priceOrderLines(catalogue, [
      line("levis-501-straight-w32-l30"),
    ]);

    expect(result.ok).toBe(true);
    expect(result.lines[0].unitCents).toBe(420000);
    expect(result.lines[0].name).toBe("Levi's 501 Straight");
  });

  test("every line is exactly one piece, whatever the client asks for", () => {
    const result = priceOrderLines(catalogue, [
      line("levis-501-straight-w32-l30"),
    ]);

    expect(result.lines[0].quantity).toBe(1);
  });

  test("the same piece twice collapses to one line", () => {
    const result = priceOrderLines(catalogue, [
      line("levis-501-straight-w32-l30"),
      line("levis-501-straight-w32-l30"),
    ]);

    expect(result.lines).toHaveLength(1);
  });

  test("carries size and condition onto the order", () => {
    const result = priceOrderLines(catalogue, [
      line("levis-501-straight-w32-l30"),
    ]);

    expect(result.lines[0].size).toBe("W32 L30");
    expect(result.lines[0].condition).toBe("Good");
    expect(result.lines[0].sku).toBe("GS-0101");
  });

  test("refuses a piece that has already sold", () => {
    const result = priceOrderLines(catalogue, [line("carhartt-duck-jacket-l")]);

    expect(result.ok).toBe(false);
    expect(result.error).toContain("already sold");
  });

  test("refuses a piece held in someone else's cart", () => {
    const result = priceOrderLines(catalogue, [line("levis-trucker-jacket-m")]);

    expect(result.ok).toBe(false);
    expect(result.error).toContain("someone else");
  });

  test("lets an expired hold through", () => {
    const expired = catalogue.map((product) =>
      product.slug === "levis-trucker-jacket-m"
        ? { ...product, reservedUntil: new Date(Date.now() - 1000).toISOString() }
        : product
    );

    expect(priceOrderLines(expired, [line("levis-trucker-jacket-m")]).ok).toBe(
      true
    );
  });

  test("refuses a slug that is not listed, without echoing client text", () => {
    const result = priceOrderLines(catalogue, [
      { slug: "ghost", name: "<script>alert(1)</script>" },
    ]);

    expect(result.ok).toBe(false);
    expect(result.error).not.toContain("script");
  });

  test("refuses an empty basket", () => {
    expect(priceOrderLines(catalogue, []).ok).toBe(false);
  });
});

describe("subtotalOf", () => {
  test("adds one of each", () => {
    expect(subtotalOf([{ unitCents: 420000 }, { unitCents: 1180000 }])).toBe(
      1600000
    );
  });

  test("is zero for an empty basket", () => {
    expect(subtotalOf([])).toBe(0);
  });
});
