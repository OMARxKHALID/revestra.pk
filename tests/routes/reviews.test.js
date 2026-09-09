import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

let inserted;
let signedInUserId;
let ordersFound;

const stubDb = {
  collection: (name) => {
    if (name === "products")
      return {
        find: () => ({ sort: () => ({ toArray: async () => [] }) }),
      };

    if (name === "orders")
      return { findOne: async (filter) => (ordersFound ? { ...filter } : null) };

    return {
      find: () => ({ sort: () => ({ toArray: async () => [] }) }),
      insertOne: async (document) => {
        inserted = document;
        return { acknowledged: true };
      },
    };
  },
};

mock.module("server-only", () => ({}));

mock.module("@/lib/db", () => ({
  isDatabaseConfigured: () => true,
  getDb: async () => stubDb,
}));

mock.module("@/lib/session", () => ({
  optionalSession: async () =>
    signedInUserId ? { user: { id: signedInUserId } } : null,
}));

const review = (overrides) => ({
  slug: "company-candle",
  author: "Reviewer",
  email: "someone@example.com",
  rating: 5,
  title: "A headline",
  body: "Long enough body text to satisfy the schema minimum.",
  ...overrides,
});

const post = async (body, ip) => {
  const { POST } = await import("@/app/api/reviews/route");

  return POST(
    new Request("http://localhost/api/reviews", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": ip },
      body: JSON.stringify(body),
    })
  );
};

beforeEach(() => {
  inserted = null;
  signedInUserId = null;
  ordersFound = true;
});

afterEach(() => {
  mock.restore();
});

describe("POST /api/reviews", () => {
  test("a guest review is never marked verified, whatever email it claims", async () => {
    const response = await post(review(), "10.1.0.1");
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.review.verified).toBe(false);
    expect(inserted.verified).toBe(false);
  });

  test("the reviewer's email is never echoed back", async () => {
    const response = await post(review(), "10.1.0.2");
    const body = await response.json();

    expect(body.review.email).toBeUndefined();
  });

  test("a signed-in buyer with a settled order is verified", async () => {
    signedInUserId = "abc123";

    const response = await post(review(), "10.1.0.3");
    const body = await response.json();

    expect(body.review.verified).toBe(true);
  });

  test("a signed-in user without a matching order is not verified", async () => {
    signedInUserId = "abc123";
    ordersFound = false;

    const response = await post(review(), "10.1.0.4");
    const body = await response.json();

    expect(body.review.verified).toBe(false);
  });

  test("rejects a review for a product that does not exist", async () => {
    const response = await post(review({ slug: "ghost-item" }), "10.1.0.5");

    expect(response.status).toBe(404);
  });

  test("rejects a rating outside one to five", async () => {
    const response = await post(review({ rating: 9 }), "10.1.0.6");

    expect(response.status).toBe(422);
  });

  test("rate-limits after five reviews from one address", async () => {
    let last;

    for (let attempt = 0; attempt < 6; attempt += 1)
      last = await post(review(), "10.1.0.7");

    expect(last.status).toBe(429);
  });
});
