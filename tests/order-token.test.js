import { describe, expect, test } from "bun:test";
import {
  signOrderToken,
  verifyOrderToken,
} from "../src/lib/utils/order-token.js";

const SECRET = "a-test-secret-value";
const REFERENCE = "CP-MTT0ZXX5-DKFF";

describe("order tokens", () => {
  test("round-trips a reference", () => {
    const token = signOrderToken(REFERENCE, SECRET);

    expect(verifyOrderToken(token, SECRET).reference).toBe(REFERENCE);
  });

  test("rejects a token signed with a different secret", () => {
    const token = signOrderToken(REFERENCE, SECRET);

    expect(verifyOrderToken(token, "another-secret")).toBeNull();
  });

  test("rejects an expired token", () => {
    const token = signOrderToken(REFERENCE, SECRET, Date.now() - 1000);

    expect(verifyOrderToken(token, SECRET)).toBeNull();
  });

  test("rejects a tampered payload", () => {
    const token = signOrderToken(REFERENCE, SECRET);
    const [, signature] = token.split(".");
    const forged = `${Buffer.from(`CP-OTHER.${Date.now() + 10_000}`).toString(
      "base64url"
    )}.${signature}`;

    expect(verifyOrderToken(forged, SECRET)).toBeNull();
  });

  test("rejects nonsense", () => {
    expect(verifyOrderToken("", SECRET)).toBeNull();
    expect(verifyOrderToken("nodot", SECRET)).toBeNull();
    expect(verifyOrderToken("a.b", SECRET)).toBeNull();
  });

  test("refuses to sign without a secret", () => {
    expect(() => signOrderToken(REFERENCE, "")).toThrow();
  });

  test("a token for one order does not open another", () => {
    const token = signOrderToken(REFERENCE, SECRET);

    expect(verifyOrderToken(token, SECRET).reference).not.toBe("CP-OTHER");
  });
});
