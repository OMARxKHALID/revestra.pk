import { beforeEach, describe, expect, mock, test } from "bun:test";

let session;
let products;
let orders;
let inserted;
let updated;
let deleted;

const piece = {
  sku: "GS-0500",
  slug: "levis-505-w30-l30",
  name: "Levi's 505",
  tagline: "Straight and faded",
  brand: "Levi's",
  category: "Jeans",
  sizeSystem: "waist",
  sizeLabel: "W30 L30",
  measurements: {
    Waist: '30"',
    Inseam: '30"',
    Rise: '10"',
    "Leg opening": '7"',
  },
  condition: "Good",
  conditionNotes: null,
  priceCents: 400000,
  salePriceCents: null,
  costCents: 90000,
  lot: "BALE-05",
  image: "/assets/WEBP/jeans.webp",
  images: [],
  description: "A pair of 505s",
  details: ["100% cotton"],
  status: "available",
};

const CATEGORIES = [
  { slug: "jeans", name: "Jeans", blurb: "", measurements: ["Waist", "Inseam", "Rise", "Leg opening"], order: 0, active: true },
  { slug: "shirts", name: "Shirts", blurb: "", measurements: ["Pit to pit", "Length", "Shoulder", "Sleeve"], order: 1, active: true },
];

const stubDb = {
  collection: (name) => {
    if (name === "orders")
      return { findOne: async (filter) => orders(filter) };

    if (name === "categories")
      return {
        find: () => ({ sort: () => ({ toArray: async () => CATEGORIES }) }),
      };

    return {
      findOne: async (filter) => products(filter),
      find: () => ({
        sort: () => ({
          limit: () => ({ toArray: async () => [] }),
          toArray: async () => [],
        }),
        toArray: async () => [],
      }),
      insertOne: async (document) => {
        inserted = document;
        return { acknowledged: true };
      },
      findOneAndUpdate: async (_filter, update) => {
        updated = update.$set;
        return { ...piece, ...update.$set };
      },
      deleteOne: async () => {
        deleted = true;
        return { deletedCount: 1 };
      },
    };
  },
};

mock.module("server-only", () => ({}));
mock.module("next/cache", () => ({ revalidatePath: () => {} }));
mock.module("@/auth", () => ({ auth: async () => session }));
mock.module("@/lib/db", () => ({
  isDatabaseConfigured: () => true,
  getDb: async () => stubDb,
}));
mock.module("@/lib/api/products", () => ({ invalidateCatalogue: () => {} }));

const call = async (method, body, slug) => {
  const path = slug
    ? `/api/admin/products/${slug}`
    : "/api/admin/products";

  const handlers = slug
    ? await import("@/app/api/admin/products/[slug]/route")
    : await import("@/app/api/admin/products/route");

  const request = new Request(`http://localhost:3000${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      origin: "http://localhost:3000",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  return handlers[method](request, { params: Promise.resolve({ slug }) });
};

beforeEach(() => {
  session = { user: { id: "admin-1", role: "admin" } };
  products = async () => null;
  orders = async () => null;
  inserted = undefined;
  updated = undefined;
  deleted = false;
});

describe("POST /api/admin/products", () => {
  test("creates a piece and stores it", async () => {
    const response = await call("POST", piece);

    expect(response.status).toBe(201);
    expect(inserted.slug).toBe("levis-505-w30-l30");
    expect(inserted.costCents).toBe(90000);
  });

  test("derives a slug when none is given", async () => {
    const { slug, ...withoutSlug } = piece;
    const response = await call("POST", withoutSlug);

    expect(response.status).toBe(201);
    expect(inserted.slug).toBe("levis-levis-505-w30-l30");
  });

  test("refuses a slug that is already taken", async () => {
    products = async () => piece;

    const response = await call("POST", piece);

    expect(response.status).toBe(409);
  });

  test("refuses a piece with missing measurements", async () => {
    const response = await call("POST", { ...piece, measurements: {} });

    expect(response.status).toBe(422);
  });

  test("a customer cannot create anything", async () => {
    session = { user: { id: "u1", role: "customer" } };

    const response = await call("POST", piece);

    expect(response.status).toBe(404);
    expect(inserted).toBeUndefined();
  });

  test("refuses a category that does not exist", async () => {
    const response = await call("POST", { ...piece, category: "Knitwear" });
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error).toContain("not a category");
    expect(inserted).toBeUndefined();
  });
});

describe("PATCH /api/admin/products/[slug]", () => {
  test("updates a single field", async () => {
    const response = await call("PATCH", { priceCents: 350000 }, piece.slug);

    expect(response.status).toBe(200);
    expect(updated.priceCents).toBe(350000);
  });

  test("marking it sold stamps soldAt and clears the hold", async () => {
    const response = await call("PATCH", { status: "sold" }, piece.slug);

    expect(response.status).toBe(200);
    expect(updated.status).toBe("sold");
    expect(updated.soldAt).toBeInstanceOf(Date);
    expect(updated.reservedUntil).toBeNull();
  });

  test("refuses a sale price above the list price", async () => {
    const response = await call(
      "PATCH",
      { priceCents: 100000, salePriceCents: 200000 },
      piece.slug
    );

    expect(response.status).toBe(422);
    expect(updated).toBeUndefined();
  });
});

describe("DELETE /api/admin/products/[slug]", () => {
  test("deletes a piece that is on no order", async () => {
    const response = await call("DELETE", undefined, piece.slug);

    expect(response.status).toBe(200);
    expect(deleted).toBe(true);
  });

  test("refuses to delete a piece that is on an order", async () => {
    orders = async () => ({ reference: "CP-ABC-1234" });

    const response = await call("DELETE", undefined, piece.slug);
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toContain("CP-ABC-1234");
    expect(deleted).toBe(false);
  });

  test("a customer cannot delete anything", async () => {
    session = { user: { id: "u1", role: "customer" } };

    const response = await call("DELETE", undefined, piece.slug);

    expect(response.status).toBe(404);
    expect(deleted).toBe(false);
  });

});
