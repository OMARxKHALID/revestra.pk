import { describe, expect, mock, test } from "bun:test";

mock.module("server-only", () => ({}));

const { orderAlertText, sendOrderAlert } = await import("@/lib/api/order-alert");

const order = {
  reference: "RV-TEST-0001",
  items: [
    { name: "Levi's Trucker Jacket", size: "M", unitCents: 790000 },
    { name: "Plain White Tee", size: "M", unitCents: 140000 },
  ],
  totals: { totalCents: 955000 },
  payment: { method: "cod" },
  shipping: { city: "Karachi", name: "Ayesha Khan", phone: "03001234567" },
  email: "ayesha@example.com",
};

describe("WhatsApp order alert", () => {
  test("names the order, pieces, total, payment and admin link, but no customer details", () => {
    const text = orderAlertText(order, "https://revestra.pk");

    expect(text).toContain("New order RV-TEST-0001");
    expect(text).toContain("Levi's Trucker Jacket (M)");
    expect(text).toContain("9,550");
    expect(text).toContain("Cash on delivery");
    expect(text).toContain("https://revestra.pk/admin/orders/RV-TEST-0001");
    expect(text).not.toContain("Ayesha");
    expect(text).not.toContain("03001234567");
    expect(text).not.toContain("ayesha@example.com");
  });

  test("calls CallMeBot with the owner's number and key", async () => {
    let called;

    const result = await sendOrderAlert(order, {
      config: { number: "923001234567", apiKey: "k123" },
      fetchImpl: async (url) => {
        called = new URL(url);
        return { ok: true, status: 200 };
      },
    });

    expect(result.sent).toBe(true);
    expect(called.origin + called.pathname).toBe("https://api.callmebot.com/whatsapp.php");
    expect(called.searchParams.get("phone")).toBe("+923001234567");
    expect(called.searchParams.get("apikey")).toBe("k123");
    expect(called.searchParams.get("text")).toContain("RV-TEST-0001");
  });

  test("a failing or unconfigured alert never throws", async () => {
    expect((await sendOrderAlert(order, { config: null })).sent).toBe(false);

    const failed = await sendOrderAlert(order, {
      config: { number: "923001234567", apiKey: "k" },
      fetchImpl: async () => {
        throw new Error("network down");
      },
    });

    expect(failed.sent).toBe(false);
  });
});
