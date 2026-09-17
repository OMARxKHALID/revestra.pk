import { beforeEach, describe, expect, mock, test } from "bun:test";

mock.module("server-only", () => ({}));

let rows;
let seen = [];

const collection = () => ({
  find: (filter) => {
    seen.push(filter);
    let skipped = 0;
    let limited = rows.length;

    const cursor = {
      sort: () => cursor,
      skip: (n) => {
        skipped = n;
        return cursor;
      },
      limit: (n) => {
        limited = n;
        return cursor;
      },
      toArray: async () => rows.slice(skipped, skipped + limited),
    };

    return cursor;
  },
  countDocuments: async () => rows.length,
});

mock.module("@/lib/db", () => ({
  isDatabaseConfigured: () => true,
  getDb: async () => ({ collection }),
}));

const seed = (count, key) =>
  Array.from({ length: count }, (_, i) => ({ [key]: `${key}-${i + 1}` }));

describe("admin lists page at ten a page", () => {
  beforeEach(() => {
    rows = [];
  });

  test("reviews return one page of ten plus the full count", async () => {
    rows = seed(23, "id");

    const { listReviews } = await import("@/lib/api/admin/reviews");
    const first = await listReviews({});

    expect(first.reviews).toHaveLength(10);
    expect(first.total).toBe(23);
    expect(first.page).toBe(1);
    expect(first.perPage).toBe(10);
  });

  test("reviews skip to the requested page", async () => {
    rows = seed(23, "id");

    const { listReviews } = await import("@/lib/api/admin/reviews");
    const third = await listReviews({ page: 3, perPage: 10 });

    expect(third.reviews).toHaveLength(3);
    expect(third.reviews[0].id).toBe("id-21");
  });

  test("promos page the same way", async () => {
    rows = seed(12, "code");

    const { listPromos } = await import("@/lib/api/admin/promos");
    const second = await listPromos({ page: 2, perPage: 10 });

    expect(second.promos).toHaveLength(2);
    expect(second.total).toBe(12);
    expect(second.promos[0].code).toBe("code-11");
  });

  test("subscribers page the same way", async () => {
    rows = seed(35, "email");

    const { listSubscribers } = await import("@/lib/api/subscribers");
    const first = await listSubscribers({});

    expect(first.subscribers).toHaveLength(10);
    expect(first.total).toBe(35);
  });

  test("an empty collection still answers with the envelope", async () => {
    const { listSubscribers } = await import("@/lib/api/subscribers");
    const empty = await listSubscribers({});

    expect(empty.subscribers).toEqual([]);
    expect(empty.total).toBe(0);
  });
});

describe("the needs-attention order filter", () => {
  test("it selects stock conflicts and unverified payments only when asked", async () => {
    rows = [];
    seen = [];

    const { listOrders } = await import("@/lib/api/admin/orders");

    await listOrders({});
    expect(seen[0].$and).toBeUndefined();

    await listOrders({ attention: "1" });
    expect(seen[1].$and[0].$or).toHaveLength(2);
  });
});
