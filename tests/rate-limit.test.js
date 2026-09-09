import { describe, expect, test } from "bun:test";
import { createRateLimiter } from "@/lib/rate-limit";

describe("createRateLimiter", () => {
  test("allows up to the limit then rejects", () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 1000 });

    expect(limiter.check("a").ok).toBe(true);
    expect(limiter.check("a").ok).toBe(true);
    expect(limiter.check("a").ok).toBe(true);
    expect(limiter.check("a").ok).toBe(false);
  });

  test("counts each key separately", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 });

    expect(limiter.check("a").ok).toBe(true);
    expect(limiter.check("b").ok).toBe(true);
    expect(limiter.check("a").ok).toBe(false);
  });

  test("the window rolls over on an injected clock", () => {
    let clock = 0;
    const limiter = createRateLimiter({
      limit: 1,
      windowMs: 1000,
      now: () => clock,
    });

    expect(limiter.check("a").ok).toBe(true);
    expect(limiter.check("a").ok).toBe(false);

    clock = 1001;

    expect(limiter.check("a").ok).toBe(true);
  });

  test("reports the remaining allowance", () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 1000 });

    expect(limiter.check("a").remaining).toBe(2);
    expect(limiter.check("a").remaining).toBe(1);
    expect(limiter.check("a").remaining).toBe(0);
  });

  test("evicts the oldest key rather than growing without bound", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 10_000, max: 2 });

    limiter.check("a");
    limiter.check("b");
    limiter.check("c");

    expect(limiter.check("a").ok).toBe(true);
    expect(limiter.check("c").ok).toBe(false);
  });
});
