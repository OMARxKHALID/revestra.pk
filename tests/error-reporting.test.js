import { beforeEach, describe, expect, mock, test } from "bun:test";

mock.module("server-only", () => ({}));

let captured;

mock.module("posthog-node", () => ({
  PostHog: class {
    capture() {}
    captureException(error, distinctId, properties) {
      captured = { error, distinctId, properties };
    }
    async shutdown() {}
  },
}));

const load = async () => {
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN = "phc_test";
  return import("@/lib/api/analytics");
};

beforeEach(() => {
  captured = null;
});

describe("server exception capture", () => {
  test("it forwards the error, the viewer and the context", async () => {
    const { captureServerException } = await load();
    const boom = new Error("could not store order");

    await captureServerException(boom, {
      distinctId: "anon-9",
      area: "orders",
      reference: "CP-1",
    });

    expect(captured.error).toBe(boom);
    expect(captured.distinctId).toBe("anon-9");
    expect(captured.properties.area).toBe("orders");
    expect(captured.properties.reference).toBe("CP-1");
    expect(captured.properties.distinctId).toBeUndefined();
  });

  test("an unknown viewer still reports, without a distinct id", async () => {
    const { captureServerException } = await load();

    await captureServerException(new Error("boom"), { area: "payments" });

    expect(captured.distinctId).toBeUndefined();
    expect(captured.properties.area).toBe("payments");
  });

  test("no token means nothing is sent", async () => {
    delete process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

    const { captureServerException } = await import("@/lib/api/analytics");
    const result = await captureServerException(new Error("boom"));

    expect(result.captured).toBe(false);
    expect(captured).toBeNull();
  });
});

describe("viewer id from the PostHog cookie", () => {
  test("it reads the distinct id a browser already set", async () => {
    const { viewerIdFromCookie } = await import("@/lib/api/viewer-id");
    const value = encodeURIComponent(
      JSON.stringify({ distinct_id: "abc-123" })
    );

    expect(
      viewerIdFromCookie(`foo=1; ph_phc_abc_posthog=${value}; bar=2`)
    ).toBe("abc-123");
  });

  test("a missing or malformed cookie yields nothing, never a throw", async () => {
    const { viewerIdFromCookie } = await import("@/lib/api/viewer-id");

    expect(viewerIdFromCookie(undefined)).toBeNull();
    expect(viewerIdFromCookie("other=1")).toBeNull();
    expect(viewerIdFromCookie("ph_phc_x_posthog=not-json")).toBeNull();
  });
});
