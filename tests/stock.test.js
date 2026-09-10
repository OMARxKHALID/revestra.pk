import { describe, expect, test } from "bun:test";
import {
  availabilityLabel,
  gallery,
  holdExpired,
  isAvailable,
  isReserved,
  isSold,
  measurementList,
  sellableNow,
} from "../src/lib/utils/stock.js";
import { productSchema } from "../src/lib/schemas/product.js";

const jeans = {
  slug: "levis-501-straight-w32-l30",
  sku: "GS-0101",
  name: "Levi's 501 Straight",
  tagline: "Honest fade",
  brand: "Levi's",
  category: "Jeans",
  sizeSystem: "waist",
  sizeLabel: "W32 L30",
  measurements: {
    Waist: '32"',
    Inseam: '30"',
    Rise: '11"',
    "Leg opening": '7"',
  },
  condition: "Good",
  conditionNotes: null,
  priceCents: 480000,
  salePriceCents: 420000,
  image: "/assets/WEBP/jeans.webp",
  images: [],
  description: "A pair of jeans",
  details: ["Cotton denim"],
  status: "available",
  reservedUntil: null,
  soldAt: null,
};

describe("availability", () => {
  test("reads the three states", () => {
    expect(isAvailable(jeans)).toBe(true);
    expect(isReserved({ ...jeans, status: "reserved" })).toBe(true);
    expect(isSold({ ...jeans, status: "sold" })).toBe(true);
  });

  test("an unexpired hold blocks the sale", () => {
    const held = {
      ...jeans,
      status: "reserved",
      reservedUntil: new Date(Date.now() + 60_000).toISOString(),
    };

    expect(sellableNow(held)).toBe(false);
    expect(holdExpired(held)).toBe(false);
  });

  test("an expired hold frees the piece again", () => {
    const stale = {
      ...jeans,
      status: "reserved",
      reservedUntil: new Date(Date.now() - 60_000).toISOString(),
    };

    expect(holdExpired(stale)).toBe(true);
    expect(sellableNow(stale)).toBe(true);
  });

  test("sold is never sellable, hold or not", () => {
    expect(sellableNow({ ...jeans, status: "sold" })).toBe(false);
  });

  test("labels read the way a shopper expects", () => {
    expect(availabilityLabel(jeans)).toBe("Available");
    expect(availabilityLabel({ ...jeans, status: "reserved" })).toBe(
      "In someone's cart"
    );
    expect(availabilityLabel({ ...jeans, status: "sold" })).toBe("Sold");
  });
});

describe("gallery and measurements", () => {
  test("the hero comes first and duplicates are dropped", () => {
    expect(
      gallery({ image: "/assets/a.webp", images: ["/assets/a.webp"] })
    ).toEqual(["/assets/a.webp"]);
  });

  test("measurements come back as label and value pairs", () => {
    expect(measurementList(jeans)).toContainEqual({
      label: "Inseam",
      value: '30"',
    });
  });
});

describe("product schema", () => {
  test("accepts a fully measured piece", () => {
    expect(productSchema.safeParse(jeans).success).toBe(true);
  });

  test("rejects jeans with no inseam", () => {
    const { Inseam, ...rest } = jeans.measurements;
    const result = productSchema.safeParse({ ...jeans, measurements: rest });

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain("Inseam");
  });

  test("rejects a shirt missing its pit to pit", () => {
    const result = productSchema.safeParse({
      ...jeans,
      category: "Shirts",
      sizeSystem: "alpha",
      sizeLabel: "M",
      measurements: { Length: '28"' },
    });

    expect(result.success).toBe(false);
  });

  test("accepts an accessory with no required measurements", () => {
    const result = productSchema.safeParse({
      ...jeans,
      category: "Accessories",
      sizeSystem: "one-size",
      sizeLabel: "One size",
      measurements: {},
    });

    expect(result.success).toBe(true);
  });

  test("rejects a sale price above the list price", () => {
    expect(
      productSchema.safeParse({ ...jeans, salePriceCents: 999999999 }).success
    ).toBe(false);
  });

  test("accepts any named category, because categories now live in the database", () => {
    expect(
      productSchema.safeParse({ ...jeans, category: "Knitwear" }).success
    ).toBe(true);
  });

  test("still rejects a blank category", () => {
    expect(productSchema.safeParse({ ...jeans, category: "" }).success).toBe(
      false
    );
  });
});
