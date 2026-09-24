import { describe, expect, mock, test } from "bun:test";

mock.module("server-only", () => ({}));

const order = {
  reference: "RV-TEST-000001",
  status: "pending_payment",
  items: [{ slug: "levis-501" }],
  payment: { method: "jazzcash", status: "pending" },
};

let update = null;

mock.module("@/lib/db", () => ({
  isDatabaseConfigured: () => true,
  getDb: async () => ({
    collection: () => ({
      findOne: async () => order,
      updateOne: async () => ({ matchedCount: 1, modifiedCount: 1 }),
      findOneAndUpdate: async (_filter, change) => {
        update = change;
        return { ...order, ...change.$set };
      },
    }),
  }),
}));

const { setOrderStatus } = await import("@/lib/api/admin/orders");
const { ORDER_STATUS, PAYMENT_STATUS } = await import("@/lib/schemas/order");

describe("admin cancel", () => {
  test("cancelling an unpaid gateway order voids its payment", async () => {
    const result = await setOrderStatus({
      reference: order.reference,
      status: ORDER_STATUS.cancelled,
    });

    expect(result.ok).toBe(true);
    expect(update.$set["payment.status"]).toBe(PAYMENT_STATUS.failed);
  });
});
