import { describe, expect, test } from "bun:test";
import {
  buildTotals,
  discountFor,
  shippingFor,
} from "../src/lib/utils/totals.js";
import { promoProblem } from "../src/lib/utils/promo-validity.js";
import { MOCK_PROMOS } from "../src/lib/promos.js";
import {
  DEFAULT_COMMERCE,
  DEFAULT_SHIPPING_RATES,
  rateById,
} from "../src/lib/shipping.js";

const promo = (code) => MOCK_PROMOS.find((entry) => entry.code === code);

describe("discountFor", () => {
  test("takes a percentage and rounds to whole paisa", () => {
    expect(discountFor({ kind: "percent", value: 10 }, 335000)).toBe(33500);
    expect(discountFor({ kind: "percent", value: 33 }, 100001)).toBe(33000);
  });

  test("takes a fixed amount", () => {
    expect(discountFor({ kind: "fixed", value: 50000 }, 400000)).toBe(50000);
  });

  test("never discounts more than the subtotal", () => {
    expect(discountFor({ kind: "fixed", value: 900000 }, 100000)).toBe(100000);
  });

  test("free shipping is not a line discount", () => {
    expect(discountFor({ kind: "free_shipping", value: 0 }, 400000)).toBe(0);
  });

  test("no promo means no discount", () => {
    expect(discountFor(null, 400000)).toBe(0);
  });
});

describe("shippingFor", () => {
  test("charges the chosen rate below the free threshold", () => {
    expect(shippingFor(null, 100000, "express")).toBe(rateById("express").cents);
  });

  test("falls back to the standard rate for an unknown id", () => {
    expect(shippingFor(null, 100000, "teleport")).toBe(DEFAULT_SHIPPING_RATES[0].cents);
  });

  test("is free at or above the threshold", () => {
    expect(shippingFor(null, DEFAULT_COMMERCE.freeShippingThresholdCents, "standard")).toBe(0);
  });

  test("a free-shipping code beats the threshold", () => {
    expect(shippingFor({ kind: "free_shipping" }, 100000, "express")).toBe(0);
  });

  test("charges nothing on an empty order", () => {
    expect(shippingFor(null, 0, "standard")).toBe(0);
  });
});

describe("buildTotals", () => {
  test("applies the discount before deciding on shipping", () => {
    const totals = buildTotals({
      subtotalCents: 520000,
      promo: promo("WELCOME10"),
      rateId: "standard",
    });

    expect(totals.discountCents).toBe(52000);
    expect(totals.shippingCents).toBe(DEFAULT_SHIPPING_RATES[0].cents);
    expect(totals.totalCents).toBe(520000 - 52000 + DEFAULT_SHIPPING_RATES[0].cents);
  });

  test("every component is an integer", () => {
    const totals = buildTotals({
      subtotalCents: 333333,
      promo: promo("WELCOME10"),
      rateId: "express",
    });

    for (const value of Object.values(totals))
      expect(Number.isInteger(value)).toBe(true);
  });

  test("works with no promo at all", () => {
    const totals = buildTotals({ subtotalCents: 100000, rateId: "standard" });

    expect(totals.discountCents).toBe(0);
    expect(totals.totalCents).toBe(100000 + DEFAULT_SHIPPING_RATES[0].cents);
  });
});

describe("promoProblem", () => {
  const now = new Date("2026-09-08T00:00:00.000Z");

  test("accepts a live code", () => {
    expect(promoProblem(promo("WELCOME10"), 100000, now)).toBeNull();
  });

  test("rejects an unknown code", () => {
    expect(promoProblem(null, 100000, now)).toContain("not valid");
  });

  test("rejects an expired code", () => {
    expect(promoProblem(promo("EXPIRED"), 100000, now)).toContain("expired");
  });

  test("rejects a cart below the minimum", () => {
    expect(promoProblem(promo("FREESHIP"), 100000, now)).toContain("too small");
  });

  test("accepts the same code once the cart is big enough", () => {
    expect(promoProblem(promo("FREESHIP"), 400000, now)).toBeNull();
  });

  test("rejects a fully redeemed code", () => {
    expect(
      promoProblem(
        { ...promo("RS500OFF"), redemptions: 200 },
        900000,
        now
      )
    ).toContain("fully redeemed");
  });

  test("rejects a deactivated code", () => {
    expect(
      promoProblem({ ...promo("WELCOME10"), active: false }, 900000, now)
    ).toContain("no longer active");
  });
});
