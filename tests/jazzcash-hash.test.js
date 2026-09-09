import { createHmac } from "node:crypto";
import { describe, expect, test } from "bun:test";
import {
  buildSecureHash,
  hashInput,
  hashableFields,
  verifySecureHash,
} from "../src/lib/payments/jazzcash-hash.js";

const SALT = "0F5DD14AE2E38C7EBD8814D29CF6F6F0";

const fields = {
  pp_Version: "1.1",
  pp_TxnType: "MWALLET",
  pp_Language: "EN",
  pp_MerchantID: "MER123",
  pp_SubMerchantID: "",
  pp_Password: "75019F19EA",
  pp_BankID: "",
  pp_ProductID: "",
  pp_TxnRefNo: "T20110909011",
  pp_Amount: "2995",
  pp_TxnCurrency: "PKR",
  pp_TxnDateTime: "20110909124545",
  pp_BillReference: "Cart001",
  pp_Description: "Payment for 3 items",
  pp_ReturnURL: "https://example.pk/api/payments/jazzcash/callback",
  ppmpf_1: "CP-ABC123-XYZW",
};

describe("hashableFields", () => {
  test("keeps only non-empty fields whose name starts with pp", () => {
    expect(hashableFields({ ...fields, other: "x" })).not.toContain("other");
    expect(hashableFields(fields)).not.toContain("pp_BankID");
  });

  test("includes the merchant-defined passthrough fields", () => {
    expect(hashableFields(fields)).toContain("ppmpf_1");
  });

  test("excludes pp_SecureHash from its own input", () => {
    expect(hashableFields({ ...fields, pp_SecureHash: "abc" })).not.toContain(
      "pp_SecureHash"
    );
  });

  test("sorts by ASCII, so pp_Amount comes before ppmpf_1", () => {
    const keys = hashableFields(fields);

    expect(keys.indexOf("pp_Amount")).toBeLessThan(keys.indexOf("ppmpf_1"));
    expect(keys).toEqual([...keys].sort());
  });
});

describe("hashInput", () => {
  test("puts the salt first and joins values with an ampersand", () => {
    const input = hashInput({ pp_MerchantID: "MER123", pp_Amount: "2995" }, SALT);

    expect(input).toBe(`${SALT}&2995&MER123`);
  });

  test("matches the guide's worked example", () => {
    const input = hashInput(
      { pp_MerchantID: "MER123", pp_OrderInfo: "A48cvE28", pp_Amount: "2995" },
      SALT
    );

    expect(input).toBe(`${SALT}&2995&MER123&A48cvE28`);
  });
});

describe("buildSecureHash", () => {
  test("is the hex HMAC-SHA256 of the input keyed by the salt", () => {
    const expected = createHmac("sha256", SALT)
      .update(`${SALT}&2995&MER123&A48cvE28`, "utf8")
      .digest("hex");

    expect(
      buildSecureHash(
        { pp_MerchantID: "MER123", pp_OrderInfo: "A48cvE28", pp_Amount: "2995" },
        SALT
      )
    ).toBe(expected);
  });

  test("is stable across calls", () => {
    expect(buildSecureHash(fields, SALT)).toBe(buildSecureHash(fields, SALT));
  });

  test("changes when any hashed value changes", () => {
    expect(buildSecureHash(fields, SALT)).not.toBe(
      buildSecureHash({ ...fields, pp_Amount: "2996" }, SALT)
    );
  });

  test("refuses to run without a salt", () => {
    expect(() => buildSecureHash(fields, "")).toThrow();
  });
});

describe("verifySecureHash", () => {
  const signed = { ...fields, pp_SecureHash: buildSecureHash(fields, SALT) };

  test("accepts a hash it produced", () => {
    expect(verifySecureHash(signed, SALT)).toBe(true);
  });

  test("accepts the uppercase form a gateway may return", () => {
    expect(
      verifySecureHash(
        { ...signed, pp_SecureHash: signed.pp_SecureHash.toUpperCase() },
        SALT
      )
    ).toBe(true);
  });

  test("rejects a tampered amount", () => {
    expect(verifySecureHash({ ...signed, pp_Amount: "1" }, SALT)).toBe(false);
  });

  test("rejects a missing hash", () => {
    expect(verifySecureHash(fields, SALT)).toBe(false);
  });

  test("rejects a hash of the wrong length without throwing", () => {
    expect(verifySecureHash({ ...signed, pp_SecureHash: "abc" }, SALT)).toBe(
      false
    );
  });

  test("rejects a hash made with a different salt", () => {
    expect(verifySecureHash(signed, "A".repeat(32))).toBe(false);
  });
});
