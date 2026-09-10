import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

let rows;
let configured;

const applyPipeline = (existing, pipeline, now) => {
  const [{ $set: set }] = pipeline;
  const live = existing?.resetAt instanceof Date && existing.resetAt > now;

  return {
    resetAt: live ? existing.resetAt : set.resetAt.$cond[2],
    count: live ? (existing.count ?? 0) + 1 : 1,
  };
};

const stubDb = {
  collection: () => ({
    findOneAndUpdate: async (filter, pipeline, options) => {
      const now = new Date();
      const existing = rows.get(filter._id);
      const next = applyPipeline(existing, pipeline, now);

      if (!existing && !options.upsert) return null;

      rows.set(filter._id, next);

      return { _id: filter._id, ...next };
    },
  }),
};

mock.module("server-only", () => ({}));
mock.module("@/lib/db", () => ({
  isDatabaseConfigured: () => configured,
  getDb: async () => (configured ? stubDb : null),
}));

const { createLimiter } = await import("@/lib/rate-limit");

beforeEach(() => {
  rows = new Map();
  configured = true;
});

afterEach(() => {
  mock.restore();
});

describe("shared rate limiting", () => {
  test("two server instances share one allowance", async () => {
    const instanceA = createLimiter({ limit: 3, windowMs: 60_000 });
    const instanceB = createLimiter({ limit: 3, windowMs: 60_000 });

    expect((await instanceA.check("1.2.3.4")).ok).toBe(true);
    expect((await instanceB.check("1.2.3.4")).ok).toBe(true);
    expect((await instanceA.check("1.2.3.4")).ok).toBe(true);
    expect((await instanceB.check("1.2.3.4")).ok).toBe(false);
  });

  test("the allowance is counted per key", async () => {
    const limiter = createLimiter({ limit: 1, windowMs: 60_000 });

    expect((await limiter.check("a")).ok).toBe(true);
    expect((await limiter.check("b")).ok).toBe(true);
    expect((await limiter.check("a")).ok).toBe(false);
  });

  test("it reports the remaining allowance and a reset time", async () => {
    const limiter = createLimiter({ limit: 2, windowMs: 60_000 });
    const first = await limiter.check("1.2.3.4");

    expect(first.remaining).toBe(1);
    expect(first.resetAt).toBeGreaterThan(Date.now());
  });

  test("without a database it falls back to the in-process counter", async () => {
    configured = false;

    const limiter = createLimiter({ limit: 2, windowMs: 60_000 });

    expect((await limiter.check("1.2.3.4")).ok).toBe(true);
    expect((await limiter.check("1.2.3.4")).ok).toBe(true);
    expect((await limiter.check("1.2.3.4")).ok).toBe(false);
    expect(rows.size).toBe(0);
  });
});
