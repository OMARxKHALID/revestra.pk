import { describe, expect, test, mock } from "bun:test";
import { createHash } from "node:crypto";

mock.module("server-only", () => ({}));

const { parameterString, signParams } = await import("@/lib/api/cloudinary-sign");

describe("cloudinary signature", () => {
  test("sorts parameters alphabetically and joins them with ampersands", () => {
    expect(
      parameterString({ timestamp: 1315060510, public_id: "sample_image" })
    ).toBe("public_id=sample_image&timestamp=1315060510");
  });

  test("excludes file, api_key, cloud_name and resource_type", () => {
    const built = parameterString({
      file: "data:image/png;base64,AAA",
      api_key: "1234",
      cloud_name: "demo",
      resource_type: "image",
      timestamp: 1,
    });

    expect(built).toBe("timestamp=1");
  });

  test("drops empty values rather than signing them", () => {
    expect(parameterString({ timestamp: 5, public_id: "", folder: "shop" })).toBe(
      "folder=shop&timestamp=5"
    );
  });

  test("hashes the parameter string with the secret appended, no delimiter", () => {
    const params = { timestamp: 1315060510, public_id: "sample_image" };
    const secret = "abcd";
    const expected = createHash("sha1")
      .update("public_id=sample_image&timestamp=1315060510abcd", "utf8")
      .digest("hex");

    expect(signParams(params, secret)).toBe(expected);
  });

  test("a different secret yields a different signature", () => {
    const params = { timestamp: 1 };

    expect(signParams(params, "one")).not.toBe(signParams(params, "two"));
  });

  test("an attacker-supplied extra parameter never enters the signature", () => {
    const clean = signParams({ timestamp: 1, folder: "products" }, "s");
    const tampered = signParams(
      { timestamp: 1, folder: "products", eager: "w_9999" },
      "s"
    );

    expect(tampered).toBe(clean);
  });
});
