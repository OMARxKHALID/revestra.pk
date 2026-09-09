import { describe, expect, test } from "bun:test";
import { orderSchema, shippingSchema } from "../src/lib/schemas/order.js";

const shipping = {
  name: "Omar Test",
  email: "omar@example.com",
  phone: "0300 1234567",
  address: "12 Policy Lane",
  city: "New York",
  postalCode: "10001",
  country: "USA",
};

const line = {
  slug: "company-candle",
  name: "Company Candle",
  size: null,
  quantity: 1,
  unitCents: 3700,
};

const messages = (result) =>
  result.success ? [] : result.error.issues.map((i) => i.message);

describe("shipping details", () => {
  test("accepts a complete address", () => {
    expect(shippingSchema.safeParse(shipping).success).toBe(true);
  });

  test("apartment is optional and may be empty", () => {
    expect(
      shippingSchema.safeParse({ ...shipping, apartment: "" }).success
    ).toBe(true);
    expect(
      shippingSchema.safeParse({ ...shipping, apartment: "4B" }).success
    ).toBe(true);
  });

  test("rejects a malformed email", () => {
    expect(messages(shippingSchema.safeParse({ ...shipping, email: "nope" })))
      .toContain("Enter a valid email address");
  });

  test("trims before checking length, so spaces are not a name", () => {
    expect(shippingSchema.safeParse({ ...shipping, name: "   " }).success).toBe(
      false
    );
  });
});

describe("order", () => {
  test("accepts a valid order", () => {
    expect(orderSchema.safeParse({ shipping, items: [line] }).success).toBe(true);
  });

  test("rejects an empty cart with a readable message", () => {
    expect(messages(orderSchema.safeParse({ shipping, items: [] }))).toContain(
      "Your cart is empty"
    );
  });

  test("rejects a zero or negative quantity", () => {
    for (const quantity of [0, -1])
      expect(
        orderSchema.safeParse({ shipping, items: [{ ...line, quantity }] })
          .success
      ).toBe(false);
  });

  test("rejects a fractional quantity", () => {
    expect(
      orderSchema.safeParse({ shipping, items: [{ ...line, quantity: 1.5 }] })
        .success
    ).toBe(false);
  });

  test("rejects a non-integer price", () => {
    expect(
      orderSchema.safeParse({ shipping, items: [{ ...line, unitCents: 37.5 }] })
        .success
    ).toBe(false);
  });
});
