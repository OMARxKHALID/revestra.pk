import { beforeEach, describe, expect, mock, test } from "bun:test";

mock.module("server-only", () => ({}));

let order;
let updates;

const collection = () => ({
  findOne: async () => order,
  updateOne: async (filter, update) => {
    const allowed = filter.status?.$in ?? [filter.status];

    if (!allowed.includes(order.status)) return { modifiedCount: 0 };

    updates.push(update.$set.status);
    order.status = update.$set.status;

    return { modifiedCount: 1 };
  },
  find: () => ({
    sort: () => ({ skip: () => ({ limit: () => ({ toArray: async () => [] }) }) }),
    toArray: async () => [],
  }),
  countDocuments: async () => 0,
});

mock.module("@/lib/db", () => ({
  isDatabaseConfigured: () => true,
  getDb: async () => ({ collection }),
}));

const base = {
  reference: "CP-CANCEL-1",
  items: [{ slug: "levis-501" }],
  promo: null,
  promoRedeemed: false,
  payment: { status: "not_required", method: "cod" },
};

beforeEach(() => {
  updates = [];
  order = structuredClone({ ...base, status: "received" });
});

describe("a customer cancelling their own order", () => {
  test("a received cash order can be cancelled", async () => {
    const { cancelOwnOrder } = await import("@/lib/api/fulfilment");
    const result = await cancelOwnOrder("CP-CANCEL-1");

    expect(result.ok).toBe(true);
    expect(updates).toEqual(["cancelled"]);
  });

  test("an unpaid order awaiting payment can be cancelled", async () => {
    order.status = "pending_payment";
    order.payment.status = "pending";

    const { cancelOwnOrder } = await import("@/lib/api/fulfilment");

    expect((await cancelOwnOrder("CP-CANCEL-1")).ok).toBe(true);
  });

  test("a paid order is refused, since cancelling it would owe a refund", async () => {
    order.payment.status = "paid";

    const { cancelOwnOrder } = await import("@/lib/api/fulfilment");
    const result = await cancelOwnOrder("CP-CANCEL-1");

    expect(result.ok).toBe(false);
    expect(result.error).toContain("refund");
    expect(updates).toEqual([]);
  });

  test("a shipped order is refused", async () => {
    order.status = "shipped";

    const { cancelOwnOrder } = await import("@/lib/api/fulfilment");
    const result = await cancelOwnOrder("CP-CANCEL-1");

    expect(result.ok).toBe(false);
    expect(result.error).toContain("shipped");
  });

  test("an unknown reference is refused", async () => {
    order = null;

    const { cancelOwnOrder } = await import("@/lib/api/fulfilment");

    expect((await cancelOwnOrder("CP-NOPE")).ok).toBe(false);
  });
});
