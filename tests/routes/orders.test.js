import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

const shipping = {
  name: "Omar Test",
  email: "Omar@Example.com",
  phone: "0300 1234567",
  address: "12 Policy Lane",
  city: "Karachi",
  postalCode: "75500",
  country: "Pakistan",
};

const piece = {
  slug: "levis-501-straight-w32-l30",
  name: "whatever the client claims",
  quantity: 9,
  unitCents: 1,
};

let inserted;
let insertFails;
let configured;
let redemptions;

const stubDb = {
  collection: (name) => {
    if (name === "products")
      return {
        find: () => ({ sort: () => ({ toArray: async () => [] }) }),
        updateOne: async () => ({ modifiedCount: 1 }),
      };

    if (name === "promo_codes")
      return {
        findOne: async () => null,
        updateOne: async () => {
          redemptions += 1;
          return { modifiedCount: 1 };
        },
      };

    return {
      insertOne: async (document) => {
        if (insertFails) throw new Error("connection reset");
        inserted = document;
        return { acknowledged: true };
      },
    };
  },
};

mock.module("server-only", () => ({}));

mock.module("@/lib/db", () => ({
  isDatabaseConfigured: () => configured,
  getDb: async () => (configured ? stubDb : null),
}));

const post = async (body, headers = {}) => {
  const { POST } = await import("@/app/api/orders/route");

  return POST(
    new Request("http://localhost/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: typeof body === "string" ? body : JSON.stringify(body),
    })
  );
};

beforeEach(() => {
  inserted = null;
  insertFails = false;
  configured = true;
  redemptions = 0;
});

afterEach(() => {
  mock.restore();
});

describe("POST /api/orders", () => {
  test("rejects a malformed body with 400", async () => {
    const response = await post("{not json", { "x-forwarded-for": "10.0.0.1" });

    expect(response.status).toBe(400);
  });

  test("rejects an invalid shipping address with 422", async () => {
    const response = await post(
      { shipping: { ...shipping, email: "nope" }, items: [piece] },
      { "x-forwarded-for": "10.0.0.2" }
    );

    expect(response.status).toBe(422);
  });

  test("rejects an unknown slug with 409", async () => {
    const response = await post(
      { shipping, items: [{ ...piece, slug: "ghost-item" }] },
      { "x-forwarded-for": "10.0.0.3" }
    );

    expect(response.status).toBe(409);
  });

  test("re-prices the order server-side and stores it", async () => {
    const response = await post(
      { shipping, items: [piece] },
      { "x-forwarded-for": "10.0.0.4" }
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.items[0].unitCents).toBeGreaterThan(1);
    expect(body.items[0].quantity).toBe(1);
    expect(body.items[0].size).toBe("W32 L30");
    expect(body.persisted).toBe(true);
    expect(inserted.reference).toBe(body.reference);
    expect(inserted.email).toBe("omar@example.com");
  });

  test("returns 503 when the database is configured but the write fails", async () => {
    insertFails = true;

    const response = await post(
      { shipping, items: [piece] },
      { "x-forwarded-for": "10.0.0.5" }
    );
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error).toContain("Nothing was charged");
  });

  test("succeeds without a database but says nothing was persisted", async () => {
    configured = false;

    const response = await post(
      { shipping, items: [piece] },
      { "x-forwarded-for": "10.0.0.6" }
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.persisted).toBe(false);
  });

  test("refuses a gateway that is not configured, rather than stranding the order", async () => {
    const response = await post(
      { shipping, items: [piece], method: "jazzcash" },
      { "x-forwarded-for": "10.0.0.8" }
    );
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toContain("not available");
    expect(inserted).toBeNull();
  });

  test("cash on delivery needs no gateway credentials", async () => {
    const response = await post(
      { shipping, items: [piece], method: "cod" },
      { "x-forwarded-for": "10.0.0.9" }
    );

    expect(response.status).toBe(200);
  });

  test("a cash order counts its promo redemption straight away", async () => {
    const response = await post(
      { shipping, items: [piece], method: "cod", promoCode: "WELCOME10" },
      { "x-forwarded-for": "10.0.0.10" }
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.totals.discountCents).toBeGreaterThan(0);
    expect(redemptions).toBe(1);
  });

  test("rate-limits a single address after ten orders", async () => {
    const ip = { "x-forwarded-for": "10.0.0.7" };
    let last;

    for (let attempt = 0; attempt < 11; attempt += 1)
      last = await post({ shipping, items: [piece] }, ip);

    expect(last.status).toBe(429);
    expect(last.headers.get("Retry-After")).toBeTruthy();
  });
});
