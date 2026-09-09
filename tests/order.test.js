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

const line = { slug: "levis-501-straight-w32-l30" };

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

  test("a line carries nothing but a slug, whatever the client sends", () => {
    const parsed = orderSchema.parse({
      shipping,
      items: [{ ...line, unitCents: 1, quantity: 99, name: "Free jacket" }],
    });

    expect(parsed.items[0]).toEqual({ slug: line.slug });
  });

  test("rejects a line with no slug", () => {
    expect(orderSchema.safeParse({ shipping, items: [{}] }).success).toBe(false);
  });

  test("refuses an absurdly large cart", () => {
    const items = Array.from({ length: 51 }, (_, index) => ({
      slug: `piece-${index}`,
    }));

    expect(orderSchema.safeParse({ shipping, items }).success).toBe(false);
  });
});
