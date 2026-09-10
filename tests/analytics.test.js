import { describe, expect, mock, test } from "bun:test";

mock.module("server-only", () => ({}));

const {
  ANALYTICS_EVENT,
  majorUnits,
  orderProperties,
  productProperties,
} = await import("@/lib/analytics");

const order = {
  reference: "CP-TEST-0007",
  currency: "PKR",
  distinctId: "anon-123",
  promo: { code: "WELCOME" },
  payment: { method: "cod" },
  totals: {
    subtotalCents: 420000,
    totalCents: 445000,
    shippingCents: 25000,
    taxCents: 0,
    discountCents: 0,
  },
  items: [
    {
      slug: "levis-501",
      sku: "GS-0001",
      name: "Levi's 501",
      brand: "Levi's",
      category: "Jeans",
      sizeLabel: "W32 L30",
      unitCents: 420000,
      image: "/assets/jeans.webp",
    },
  ],
};

describe("analytics properties", () => {
  test("paisa become major units, so revenue is not out by a hundred", () => {
    expect(majorUnits(445000)).toBe(4450);
    expect(majorUnits(1)).toBe(0.01);
  });

  test("order properties carry the spec field names", () => {
    const props = orderProperties(order);

    expect(props.order_id).toBe("CP-TEST-0007");
    expect(props.revenue).toBe(4450);
    expect(props.total).toBe(4450);
    expect(props.subtotal).toBe(4200);
    expect(props.shipping).toBe(250);
    expect(props.coupon).toBe("WELCOME");
    expect(props.currency).toBe("PKR");
    expect(props.products).toHaveLength(1);
  });

  test("a product maps onto the ecommerce spec shape", () => {
    const [product] = orderProperties(order).products;

    expect(product.product_id).toBe("levis-501");
    expect(product.name).toBe("Levi's 501");
    expect(product.variant).toBe("W32 L30");
    expect(product.price).toBe(4200);
  });

  test("a catalogue product prefers its sale price", () => {
    const props = productProperties({
      slug: "jacket",
      name: "Jacket",
      priceCents: 500000,
      salePriceCents: 300000,
    });

    expect(props.price).toBe(3000);
  });

  test("event names match the PostHog ecommerce spec", () => {
    expect(ANALYTICS_EVENT.orderCompleted).toBe("Order Completed");
    expect(ANALYTICS_EVENT.checkoutStarted).toBe("Checkout Started");
    expect(ANALYTICS_EVENT.productAdded).toBe("Product Added");
    expect(ANALYTICS_EVENT.productViewed).toBe("Product Viewed");
  });
});

describe("server capture", () => {
  test("it sends nothing when no token is configured", async () => {
    delete process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

    const { captureServerEvent } = await import("@/lib/api/analytics");
    const result = await captureServerEvent({
      distinctId: "anon-123",
      event: ANALYTICS_EVENT.orderCompleted,
      properties: {},
    });

    expect(result.captured).toBe(false);
  });

  test("it sends nothing without a distinct id, so events cannot orphan", async () => {
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN = "phc_test";

    const { captureServerEvent } = await import("@/lib/api/analytics");
    const result = await captureServerEvent({
      distinctId: null,
      event: ANALYTICS_EVENT.orderCompleted,
      properties: {},
    });

    expect(result.captured).toBe(false);

    delete process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  });
});
