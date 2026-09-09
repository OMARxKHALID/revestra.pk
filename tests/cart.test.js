import { beforeEach, describe, expect, test } from "bun:test";
import useCart, { selectCount, selectSubtotal } from "../src/store/use-cart.js";

const jeans = {
  slug: "levis-501-straight-w32-l30",
  sku: "GS-0101",
  name: "Levi's 501 Straight",
  image: "/assets/WEBP/jeans.webp",
  sizeLabel: "W32 L30",
  condition: "Good",
  priceCents: 480000,
  salePriceCents: 420000,
};

const jacket = {
  slug: "carhartt-duck-jacket-l",
  sku: "GS-0201",
  name: "Carhartt Duck Chore Jacket",
  image: "/assets/WEBP/jacket.webp",
  sizeLabel: "L",
  condition: "Good",
  priceCents: 1450000,
  salePriceCents: null,
};

const state = () => useCart.getState();

describe("cart", () => {
  beforeEach(() => state().clear());

  test("adds at the sale price when there is one", () => {
    state().addItem(jeans);
    expect(state().items[0].unitCents).toBe(420000);
  });

  test("falls back to the list price", () => {
    state().addItem(jacket);
    expect(state().items[0].unitCents).toBe(1450000);
  });

  test("adding the same piece twice is a no-op", () => {
    state().addItem(jeans);
    state().addItem(jeans);

    expect(state().items).toHaveLength(1);
    expect(selectCount(state())).toBe(1);
  });

  test("carries size and condition into the line", () => {
    state().addItem(jeans);

    expect(state().items[0].size).toBe("W32 L30");
    expect(state().items[0].condition).toBe("Good");
  });

  test("every line is a single piece", () => {
    state().addItem(jeans);
    expect(state().items[0].quantity).toBe(1);
  });

  test("removeItem takes out only that piece", () => {
    state().addItem(jeans);
    state().addItem(jacket);
    state().removeItem(jeans.slug);

    expect(state().items).toHaveLength(1);
    expect(state().items[0].slug).toBe(jacket.slug);
  });

  test("has() reports what is in the cart", () => {
    state().addItem(jeans);

    expect(state().has(jeans.slug)).toBe(true);
    expect(state().has(jacket.slug)).toBe(false);
  });

  test("the subtotal adds one of each", () => {
    state().addItem(jeans);
    state().addItem(jacket);

    expect(selectSubtotal(state())).toBe(420000 + 1450000);
  });

  test("an empty cart has no count and no subtotal", () => {
    expect(selectCount(state())).toBe(0);
    expect(selectSubtotal(state())).toBe(0);
  });
});

describe("cart persistence", () => {
  test("a cart from the retail model is dropped, not carried over", () => {
    const { migrate } = useCart.persist.getOptions();

    expect(migrate({ items: [{ slug: "x", quantity: 4 }] }, 2)).toEqual({
      items: [],
    });
  });

  test("a current cart migrates untouched", () => {
    const { migrate } = useCart.persist.getOptions();
    const current = { items: [{ slug: "x", quantity: 1 }] };

    expect(migrate(current, 3)).toBe(current);
  });
});
