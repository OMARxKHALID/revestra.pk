import { describe, expect, test } from "bun:test";
import { whatsappLink, whatsappNumber } from "../src/lib/utils/whatsapp.js";

describe("WhatsApp buy link", () => {
  test("Pakistani numbers in any common format become international", () => {
    expect(whatsappNumber("0300 1234567")).toBe("923001234567");
    expect(whatsappNumber("+92 300-1234567")).toBe("923001234567");
    expect(whatsappNumber("0092 300 1234567")).toBe("923001234567");
  });

  test("no usable number means no button", () => {
    expect(whatsappNumber("")).toBeNull();
    expect(whatsappNumber("12345")).toBeNull();
  });

  test("the message names the piece, its price and its page", () => {
    const link = whatsappLink(
      "923001234567",
      {
        name: "Levi's Trucker Jacket",
        brand: "Levi's",
        sizeLabel: "M",
        condition: "Good",
        priceCents: 850000,
        salePriceCents: 790000,
        sku: "RV-0203",
      },
      "https://revestra.pk/products/levis-trucker-jacket-m"
    );
    const text = decodeURIComponent(new URL(link).searchParams.get("text"));

    expect(link.startsWith("https://wa.me/923001234567?text=")).toBe(true);
    expect(text).toContain("Levi's Trucker Jacket — Levi's, M, Good");
    expect(text).toContain("7,900");
    expect(text).toContain("SKU: RV-0203");
    expect(text).toContain("https://revestra.pk/products/levis-trucker-jacket-m");
  });
});

describe("WhatsApp number setting", () => {
  test("blank is allowed and a bad number is refused with a clear message", async () => {
    const { settingsSchema } = await import("../src/lib/schemas/settings.js");
    const { DEFAULT_SETTINGS } = await import("../src/lib/settings.js");

    expect(settingsSchema.safeParse({ ...DEFAULT_SETTINGS, whatsapp: "" }).success).toBe(true);
    expect(settingsSchema.safeParse({ ...DEFAULT_SETTINGS, whatsapp: "0300 1234567" }).success).toBe(true);

    const bad = settingsSchema.safeParse({ ...DEFAULT_SETTINGS, whatsapp: "12345" });

    expect(bad.success).toBe(false);
    expect(bad.error.issues[0].message).toContain("full mobile number");
  });
});
