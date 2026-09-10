import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

let products;

const matches = (product, filter) => {
  if (filter.slug !== product.slug) return false;
  if (filter.reservedBy !== undefined && product.reservedBy !== filter.reservedBy)
    return false;
  if (typeof filter.status === "string" && product.status !== filter.status)
    return false;
  if (filter.status?.$ne !== undefined && product.status === filter.status.$ne)
    return false;

  if (filter.$or)
    return filter.$or.some((clause) =>
      clause.status
        ? product.status === clause.status
        : product.reservedUntil !== null &&
          product.reservedUntil <= clause.reservedUntil.$lte
    );

  return true;
};

const stubDb = {
  collection: () => ({
    updateOne: async (filter, update) => {
      const product = products.find((entry) => matches(entry, filter));

      if (!product) return { matchedCount: 0, modifiedCount: 0 };

      Object.assign(product, update.$set);

      return { matchedCount: 1, modifiedCount: 1 };
    },
  }),
};

mock.module("server-only", () => ({}));
mock.module("@/lib/db", () => ({
  isDatabaseConfigured: () => true,
  getDb: async () => stubDb,
}));

const { reserveStock, releaseStock, markSold } = await import(
  "@/lib/api/inventory"
);

const line = [{ slug: "levis-501", name: "Levi's 501" }];

beforeEach(() => {
  products = [
    {
      slug: "levis-501",
      status: "available",
      reservedUntil: null,
      reservedBy: null,
    },
  ];
});

afterEach(() => {
  mock.restore();
});

describe("one-off reservation", () => {
  test("only one of two racing buyers wins the item", async () => {
    const [first, second] = await Promise.all([
      reserveStock(line, { reference: "CP-A" }),
      reserveStock(line, { reference: "CP-B" }),
    ]);

    expect([first.ok, second.ok].filter(Boolean)).toHaveLength(1);
    expect(products[0].status).toBe("reserved");
  });

  test("the winner's reference is stamped on the reservation", async () => {
    await reserveStock(line, { reference: "CP-A" });

    expect(products[0].reservedBy).toBe("CP-A");
  });

  test("a second buyer cannot reserve an item already held", async () => {
    await reserveStock(line, { reference: "CP-A" });

    const second = await reserveStock(line, { reference: "CP-B" });

    expect(second.ok).toBe(false);
    expect(second.error).toContain("already gone");
    expect(products[0].reservedBy).toBe("CP-A");
  });

  test("releasing another order's reservation is a no-op", async () => {
    await reserveStock(line, { reference: "CP-A" });
    await releaseStock(line, "CP-B");

    expect(products[0].status).toBe("reserved");
    expect(products[0].reservedBy).toBe("CP-A");
  });

  test("the holder can release its own reservation", async () => {
    await reserveStock(line, { reference: "CP-A" });
    await releaseStock(line, "CP-A");

    expect(products[0].status).toBe("available");
    expect(products[0].reservedBy).toBeNull();
  });

  test("a stale callback cannot sell an item held by someone else", async () => {
    await reserveStock(line, { reference: "CP-B" });

    const result = await markSold(line, "CP-A");

    expect(result.sold).toBe(false);
    expect(result.contested).toContain("levis-501");
    expect(products[0].status).toBe("reserved");
  });

  test("the holder can mark its own item sold", async () => {
    await reserveStock(line, { reference: "CP-A" });

    const result = await markSold(line, "CP-A");

    expect(result.sold).toBe(true);
    expect(products[0].status).toBe("sold");
  });

  test("a released reservation frees the item for the next buyer", async () => {
    await reserveStock(line, { reference: "CP-A" });
    await releaseStock(line, "CP-A");

    const second = await reserveStock(line, { reference: "CP-B" });

    expect(second.ok).toBe(true);
    expect(products[0].reservedBy).toBe("CP-B");
  });
});
