import { beforeEach, describe, expect, mock, test } from "bun:test";
import { z } from "zod";

mock.module("server-only", () => ({}));

mock.module("@/lib/payments/config", () => ({
  siteUrl: () => "http://localhost:3000",
}));

const { gateRequest, readBody, guardRequest } = await import(
  "@/lib/api/request"
);

const schema = z.object({
  email: z.email("Enter a valid email address"),
});

const post = (body, origin = "http://localhost:3000") =>
  new Request("http://localhost:3000/api/thing", {
    method: "POST",
    headers: origin
      ? { "content-type": "application/json", origin }
      : { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

let allowed;

const limiter = {
  check: async () => ({ ok: allowed, resetAt: Date.now() + 60_000 }),
};

beforeEach(() => {
  allowed = true;
});

describe("the shared request guard", () => {
  test("a cross-origin post is refused", async () => {
    const { response } = await gateRequest(
      post({ email: "a@b.com" }, "https://evil.example"),
      limiter
    );

    expect(response.status).toBe(403);
  });

  test("a post with no origin header is refused", async () => {
    const { response } = await gateRequest(
      post({ email: "a@b.com" }, null),
      limiter
    );

    expect(response.status).toBe(403);
  });

  test("exhausting the limiter answers 429", async () => {
    allowed = false;

    const { response } = await gateRequest(post({ email: "a@b.com" }), limiter);

    expect(response.status).toBe(429);
  });

  test("malformed json answers 400", async () => {
    const { response } = await readBody(post("{ not json"), schema);

    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe("Malformed request");
  });

  test("a schema failure answers 422 with the field message", async () => {
    const { response } = await readBody(post({ email: "nope" }), schema);

    expect(response.status).toBe(422);
    expect((await response.json()).error).toBe("Enter a valid email address");
  });

  test("the fallback message covers an issue with no message", async () => {
    const bare = z.object({ n: z.number() });
    const { response } = await readBody(post({ n: "x" }), bare, "Invalid thing");
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(typeof body.error).toBe("string");
  });

  test("a good request returns parsed data and no response", async () => {
    const result = await guardRequest(post({ email: "a@b.com" }), {
      limiter,
      schema,
    });

    expect(result.response).toBeUndefined();
    expect(result.data.email).toBe("a@b.com");
  });

  test("the gate runs before the body is read", async () => {
    allowed = false;

    const result = await guardRequest(post("{ not json"), { limiter, schema });

    expect(result.response.status).toBe(429);
  });
});
