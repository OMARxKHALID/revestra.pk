import { describe, expect, mock, test } from "bun:test";

mock.module("server-only", () => ({}));

let sent;

mock.module("resend", () => ({
  Resend: class {
    emails = {
      send: async (payload) => {
        sent = payload;
        return { id: "test" };
      },
    };
  },
}));

const order = (status, tracking = null) => ({
  reference: "CP-TEST-0001",
  email: "buyer@example.com",
  status,
  tracking,
  shipping: { name: "Ayesha Khan" },
});

const load = async () => {
  process.env.RESEND_API_KEY = "test-key";
  return import("@/lib/email");
};

describe("order status emails", () => {
  test("a shipped order emails the buyer with the tracking details", async () => {
    sent = null;

    const { sendOrderStatusUpdate } = await load();
    await sendOrderStatusUpdate(
      order("shipped", { courier: "TCS", number: "AB123" }),
      "https://shop.test/orders/CP-TEST-0001?t=x"
    );

    expect(sent.to).toBe("buyer@example.com");
    expect(sent.subject).toContain("shipped");
    expect(sent.text).toContain("on its way");
    expect(sent.text).toContain("TCS");
    expect(sent.text).toContain("AB123");
  });

  test("a cancelled order says nothing about tracking", async () => {
    sent = null;

    const { sendOrderStatusUpdate } = await load();
    await sendOrderStatusUpdate(order("cancelled"), "https://shop.test/x");

    expect(sent.text).toContain("cancelled");
    expect(sent.text).not.toContain("Tracking");
  });

  test("a status with no customer meaning sends nothing", async () => {
    sent = null;

    const { sendOrderStatusUpdate } = await load();
    const result = await sendOrderStatusUpdate(
      order("received"),
      "https://shop.test/x"
    );

    expect(result.sent).toBe(false);
    expect(sent).toBeNull();
  });
});
