import { describe, expect, mock, test } from "bun:test";

mock.module("server-only", () => ({}));

mock.module("@/lib/db", () => ({
  isDatabaseConfigured: () => true,
  getDb: async () => null,
}));

const { buildTotals } = await import("@/lib/utils/totals");
const { DEFAULT_COMMERCE } = await import("@/lib/shipping");
const { settingsSchema } = await import("@/lib/schemas/settings");
const { DEFAULT_SETTINGS } = await import("@/lib/settings");
const { listMethods } = await import("@/lib/payments");

describe("commerce settings", () => {
  test("the shipped defaults still parse", () => {
    const parsed = settingsSchema.safeParse(DEFAULT_SETTINGS);

    expect(parsed.success).toBe(true);
  });

  test("a shop-set tax rate is applied", () => {
    const totals = buildTotals({
      subtotalCents: 100000,
      rateId: "standard",
      commerce: { ...DEFAULT_COMMERCE, taxRate: 0.17 },
    });

    expect(totals.taxCents).toBe(17000);
  });

  test("a shop-set free shipping threshold is applied", () => {
    const commerce = {
      ...DEFAULT_COMMERCE,
      freeShippingThresholdCents: 50000,
    };

    expect(
      buildTotals({ subtotalCents: 60000, rateId: "standard", commerce })
        .shippingCents
    ).toBe(0);
  });

  test("a shop-set rate price is applied", () => {
    const commerce = {
      ...DEFAULT_COMMERCE,
      shippingRates: [{ id: "standard", label: "Standard", note: "", cents: 999 }],
    };

    expect(
      buildTotals({ subtotalCents: 1000, rateId: "standard", commerce })
        .shippingCents
    ).toBe(999);
  });

  test("omitting commerce falls back to the shipped defaults", () => {
    const totals = buildTotals({ subtotalCents: 100000, rateId: "standard" });

    expect(totals.shippingCents).toBe(DEFAULT_COMMERCE.shippingRates[0].cents);
    expect(totals.taxCents).toBe(0);
  });
});

describe("payment method toggles", () => {
  test("a switched-off method is unavailable even when configured", () => {
    const methods = listMethods({ enabledMethods: ["jazzcash"] });
    const cod = methods.find((method) => method.id === "cod");

    expect(cod.available).toBe(false);
  });

  test("with no settings every configured method stays available", () => {
    const cod = listMethods().find((method) => method.id === "cod");

    expect(cod.available).toBe(true);
  });

  test("notes come from settings when set", () => {
    const methods = listMethods({
      enabledMethods: ["cod"],
      paymentNotes: { cod: "Cash to the rider" },
    });

    expect(methods.find((method) => method.id === "cod").note).toBe(
      "Cash to the rider"
    );
  });
});
