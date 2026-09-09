import { describe, expect, test } from "bun:test";
import { formatPrice, sumCents } from "../src/lib/utils/price.js";

describe("formatPrice", () => {
  test("renders whole rupees without decimals", () => {
    expect(formatPrice(560000)).toBe("Rs 5,600");
    expect(formatPrice(0)).toBe("Rs 0");
  });

  test("renders fractional amounts with two decimals", () => {
    expect(formatPrice(125050)).toBe("Rs 1,250.50");
    expect(formatPrice(99)).toBe("Rs 0.99");
  });

  test("does not lose paisa on values that float-divide badly", () => {
    expect(formatPrice(107000)).toBe("Rs 1,070");
    expect(formatPrice(293070)).toBe("Rs 2,930.70");
  });

  test("uses a plain space, never a non-breaking one", () => {
    expect(formatPrice(560000)).not.toContain(" ");
  });
});

describe("sumCents", () => {
  test("multiplies each line and adds them up", () => {
    expect(
      sumCents([
        { unitCents: 560000, quantity: 2 },
        { unitCents: 335000, quantity: 1 },
      ])
    ).toBe(1455000);
  });

  test("is zero for an empty cart", () => {
    expect(sumCents([])).toBe(0);
  });
});
