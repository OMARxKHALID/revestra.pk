import { describe, expect, test } from "bun:test";
import {
  buildMerchantHash,
  hashInput,
  toEasypaisaAmount,
} from "../src/lib/payments/easypaisa-hash.js";

const KEY = "N2VjNWQ3ZTNiMjJk";

const params = {
  amount: "25.0",
  autoRedirect: "1",
  expiryDate: "20260908 235959",
  mobileNum: "",
  orderRefNum: "CPABC123XYZW1",
  paymentMethod: "MA_PAYMENT_METHOD",
  postBackURL: "https://example.pk/api/payments/easypaisa/callback",
  storeId: "12345",
};

describe("hashInput", () => {
  test("joins key=value pairs sorted alphabetically", () => {
    expect(hashInput({ storeId: "1", amount: "2.0", orderRefNum: "A" })).toBe(
      "amount=2.0&orderRefNum=A&storeId=1"
    );
  });

  test("drops empty values such as an absent mobile number", () => {
    expect(hashInput(params)).not.toContain("mobileNum");
  });

  test("keeps every populated field", () => {
    const input = hashInput(params);

    expect(input.startsWith("amount=25.0&autoRedirect=1&expiryDate=")).toBe(true);
    expect(input).toContain("storeId=12345");
  });
});

describe("buildMerchantHash", () => {
  test("is deterministic base64 for the same key and params", () => {
    const first = buildMerchantHash(params, KEY);

    expect(first).toBe(buildMerchantHash(params, KEY));
    expect(first).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });

  test("changes when the amount changes", () => {
    expect(buildMerchantHash(params, KEY)).not.toBe(
      buildMerchantHash({ ...params, amount: "26.0" }, KEY)
    );
  });

  test("changes when the key changes", () => {
    expect(buildMerchantHash(params, KEY)).not.toBe(
      buildMerchantHash(params, "0123456789abcdef")
    );
  });

  test("rejects a key that is not sixteen bytes, with a readable message", () => {
    expect(() => buildMerchantHash(params, "tooshort")).toThrow(
      /exactly 16 bytes/
    );
  });

  test("refuses to run without a key", () => {
    expect(() => buildMerchantHash(params, "")).toThrow(/hash key is required/);
  });
});

describe("toEasypaisaAmount", () => {
  test("renders whole rupees with a single decimal", () => {
    expect(toEasypaisaAmount(2500)).toBe("25.0");
    expect(toEasypaisaAmount(560000)).toBe("5600.0");
  });

  test("renders paisa with two decimals", () => {
    expect(toEasypaisaAmount(2550)).toBe("25.50");
    expect(toEasypaisaAmount(99)).toBe("0.99");
  });
});
