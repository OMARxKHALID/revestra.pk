import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

mock.module("server-only", () => ({}));

let orders;
let products;
let promos;

const collectionFor = (name) => {
  if (name === "orders") return orders;
  if (name === "products") return products;

  return promos;
};

const fakeCollection = (rows) => ({
  rows,
  find(filter) {
    return {
      toArray: async () =>
        rows.filter((row) =>
          filter.status ? row.status === filter.status : true
        ),
    };
  },
  async updateOne(filter, update) {
    const row = rows.find((entry) =>
      filter.slug ? entry.slug === filter.slug : entry.reference === filter.reference
    );

    if (!row) return { matchedCount: 0, modifiedCount: 0 };

    Object.assign(row, update.$set ?? {});

    return { matchedCount: 1, modifiedCount: 1 };
  },
});

mock.module("@/lib/db", () => ({
  isDatabaseConfigured: () => true,
  getDb: async () => ({ collection: collectionFor }),
}));

const request = (headers = {}, body = { minutes: 60 }) =>
  new Request("http://localhost/api/admin/cron/release-stale", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  process.env.CRON_SECRET = "correct-horse-battery-staple";

  orders = fakeCollection([
    {
      reference: "CP-STALE-1",
      status: "pending_payment",
      stockReserved: true,
      promoRedeemed: false,
      promo: null,
      items: [{ slug: "faded-denim-jacket" }],
      createdAt: new Date(0),
    },
  ]);

  products = fakeCollection([
    { slug: "faded-denim-jacket", status: "reserved", reservedBy: "CP-STALE-1" },
  ]);

  promos = fakeCollection([]);
});

afterEach(() => {
  delete process.env.CRON_SECRET;
});

describe("the stale-hold release endpoint", () => {
  test("a request with no token is refused as a 404", async () => {
    const { POST } = await import(
      "@/app/api/admin/cron/release-stale/route"
    );

    expect((await POST(request())).status).toBe(404);
  });

  test("a request with the wrong token is refused as a 404", async () => {
    const { POST } = await import(
      "@/app/api/admin/cron/release-stale/route"
    );
    const response = await POST(request({ "x-cron-secret": "guess" }));

    expect(response.status).toBe(404);
  });

  test("a request is refused when no secret is configured", async () => {
    delete process.env.CRON_SECRET;

    const { POST } = await import(
      "@/app/api/admin/cron/release-stale/route"
    );
    const response = await POST(request({ "x-cron-secret": "anything" }));

    expect(response.status).toBe(404);
  });

  test("the right token releases the hold and cancels the order", async () => {
    const { POST } = await import(
      "@/app/api/admin/cron/release-stale/route"
    );
    const response = await POST(
      request({ "x-cron-secret": "correct-horse-battery-staple" })
    );

    expect(response.status).toBe(200);

    const body = await response.json();

    expect(body.released).toHaveLength(1);
    expect(body.released[0].reference).toBe("CP-STALE-1");
    expect(products.rows[0].status).toBe("available");
    expect(orders.rows[0].status).toBe("cancelled");
    expect(orders.rows[0].stockReserved).toBe(false);
  });

  test("releasing invalidates the catalogue cache in this process", async () => {
    const { primeCache, readCache } = await import(
      "@/lib/api/catalogue-cache"
    );
    const { POST } = await import(
      "@/app/api/admin/cron/release-stale/route"
    );

    primeCache(Promise.resolve([{ slug: "faded-denim-jacket" }]));

    expect(readCache()).not.toBeNull();

    await POST(request({ "x-cron-secret": "correct-horse-battery-staple" }));

    expect(readCache()).toBeNull();
  });

  test("a minutes value below the floor is rejected", async () => {
    const { POST } = await import(
      "@/app/api/admin/cron/release-stale/route"
    );
    const response = await POST(
      request({ "x-cron-secret": "correct-horse-battery-staple" }, { minutes: 1 })
    );

    expect(response.status).toBe(422);
  });
});
