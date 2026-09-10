import { beforeEach, describe, expect, mock, test } from "bun:test";

let session;

mock.module("server-only", () => ({}));

mock.module("@/auth", () => ({
  auth: async () => session,
}));

mock.module("@/lib/db", () => ({
  isDatabaseConfigured: () => true,
  getDb: async () => null,
}));

const request = (method = "GET", headers = {}) =>
  new Request("http://localhost/api/admin/products", { method, headers });

beforeEach(() => {
  session = null;
});

describe("admin guard", () => {
  test("a signed-out visitor gets a 404, never a 401", async () => {
    const { guard } = await import("@/lib/api/admin/guard");
    const { response } = await guard(request());

    expect(response.status).toBe(404);
  });

  test("a signed-in customer gets the same 404", async () => {
    session = { user: { id: "u1", role: "customer" } };

    const { guard } = await import("@/lib/api/admin/guard");
    const { response } = await guard(request());

    expect(response.status).toBe(404);
  });

  test("an admin passes and carries their id", async () => {
    session = { user: { id: "u2", role: "admin" } };

    const { guard } = await import("@/lib/api/admin/guard");
    const result = await guard(request());

    expect(result.response).toBeUndefined();
    expect(result.adminId).toBe("u2");
  });

  test("a mutation from another origin is refused as a 404, like every other admin refusal", async () => {
    session = { user: { id: "u2", role: "admin" } };

    const { guard } = await import("@/lib/api/admin/guard");
    const { response } = await guard(
      request("POST", { origin: "https://evil.example" }),
      { mutation: true }
    );

    expect(response.status).toBe(404);
  });

  test("a mutation from the site's own origin passes", async () => {
    session = { user: { id: "u2", role: "admin" } };

    const { guard } = await import("@/lib/api/admin/guard");
    const result = await guard(
      request("POST", { origin: "http://localhost:3000" }),
      { mutation: true }
    );

    expect(result.response).toBeUndefined();
  });
});
