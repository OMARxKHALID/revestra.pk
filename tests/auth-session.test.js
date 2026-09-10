import { describe, expect, mock, test } from "bun:test";

mock.module("server-only", () => ({}));

mock.module("@/lib/secrets", () => ({
  authSecret: () => "test-secret",
  cronSecret: () => process.env.CRON_SECRET?.trim() || "",
}));

describe("session lifetime", () => {
  test("the JWT expires within a day, not a month", async () => {
    const { default: authConfig, SESSION_MAX_AGE_SECONDS } = await import(
      "@/auth.config"
    );

    expect(authConfig.session.strategy).toBe("jwt");
    expect(authConfig.session.maxAge).toBe(SESSION_MAX_AGE_SECONDS);
    expect(SESSION_MAX_AGE_SECONDS).toBeLessThanOrEqual(60 * 60 * 24);
    expect(authConfig.session.updateAge).toBeGreaterThan(0);
  });

  test("signing in stamps the moment the role was last checked", async () => {
    const { default: authConfig } = await import("@/auth.config");
    const before = Date.now();

    const token = authConfig.callbacks.jwt({
      token: {},
      user: { id: "u1", role: "admin" },
    });

    expect(token.uid).toBe("u1");
    expect(token.role).toBe("admin");
    expect(token.roleCheckedAt).toBeGreaterThanOrEqual(before);
  });

  test("a token without a user keeps whatever it already held", async () => {
    const { default: authConfig } = await import("@/auth.config");

    const token = authConfig.callbacks.jwt({
      token: { uid: "u1", role: "admin", roleCheckedAt: 5 },
    });

    expect(token.roleCheckedAt).toBe(5);
  });
});
