import { describe, expect, test } from "bun:test";
import {
  attemptRefFor,
  buildFields,
  sanitizeDescription,
  stamp,
} from "../src/lib/payments/jazzcash.js";
import {
  attemptRefFor as easypaisaRef,
  buildFields as easypaisaFields,
  expiryStamp,
} from "../src/lib/payments/easypaisa.js";
import cod from "../src/lib/payments/cod.js";
import { verifySecureHash } from "../src/lib/payments/jazzcash-hash.js";

const config = {
  merchantId: "MER123",
  password: "75019F19EA",
  integritySalt: "0F5DD14AE2E38C7EBD8814D29CF6F6F0",
  action: "https://sandbox.jazzcash.com.pk/x",
};

const easypaisa = {
  storeId: "12345",
  hashKey: "N2VjNWQ3ZTNiMjJk",
  action: "https://easypaystg.easypaisa.com.pk/easypay/Index.jsf",
};

const order = {
  reference: "CP-MABC123-XYZW",
  items: [{ slug: "company-candle", quantity: 1 }],
  payment: { amountCents: 560000, method: "jazzcash", mode: "wallet" },
};

const now = new Date(2026, 8, 9, 12, 45, 45);

describe("jazzcash session fields", () => {
  const fields = buildFields({
    order,
    mode: "wallet",
    now,
    config,
    returnUrl: "https://example.pk/api/payments/jazzcash/callback",
  });

  test("the transaction reference fits the gateway's format", () => {
    expect(fields.pp_TxnRefNo).toMatch(/^[A-Za-z0-9./]{1,20}$/);
  });

  test("timestamps are fourteen digits and the expiry comes later", () => {
    expect(fields.pp_TxnDateTime).toMatch(/^\d{14}$/);
    expect(fields.pp_TxnExpiryDateTime).toMatch(/^\d{14}$/);
    expect(Number(fields.pp_TxnExpiryDateTime)).toBeGreaterThan(
      Number(fields.pp_TxnDateTime)
    );
  });

  test("the amount is sent in minor units with no separator", () => {
    expect(fields.pp_Amount).toBe("560000");
  });

  test("the currency is PKR", () => {
    expect(fields.pp_TxnCurrency).toBe("PKR");
  });

  test("the order reference travels in a passthrough field", () => {
    expect(fields.ppmpf_1).toBe(order.reference);
  });

  test("the fields carry a hash that verifies", () => {
    expect(verifySecureHash(fields, config.integritySalt)).toBe(true);
  });

  test("a wallet payment asks for the wallet rail, a card one for MIGS", () => {
    expect(fields.pp_TxnType).toBe("MWALLET");
    expect(
      buildFields({ order, mode: "card", now, config, returnUrl: "https://x" })
        .pp_TxnType
    ).toBe("MIGS");
  });
});

describe("jazzcash helpers", () => {
  test("stamp is yyyyMMddHHmmss in Pakistan time, whatever the server clock", () => {
    expect(stamp(new Date(Date.UTC(2026, 8, 8, 20, 2, 3)))).toBe("20260909010203");
  });

  test("attempt refs drop the hyphens and stay inside twenty characters", () => {
    const ref = attemptRefFor("CP-MABC123-XYZW", 2);

    expect(ref).toBe("CPMABC123XYZW2");
    expect(ref.length).toBeLessThanOrEqual(20);
  });

  test("each attempt gets its own reference", () => {
    expect(attemptRefFor("CP-MABC123-XYZW", 1)).not.toBe(
      attemptRefFor("CP-MABC123-XYZW", 2)
    );
  });

  test("the description drops characters the gateway rejects", () => {
    expect(sanitizeDescription('Order <a> "x" | y')).not.toMatch(/[<>"|]/);
  });
});

describe("easypaisa session fields", () => {
  const fields = easypaisaFields({
    order,
    mode: "wallet",
    now,
    config: easypaisa,
    postBackURL: "https://example.pk/api/payments/easypaisa/callback",
  });

  test("the amount is a decimal string, not minor units", () => {
    expect(fields.amount).toBe("5600.0");
  });

  test("the expiry uses the yyyyMMdd HHmmss shape", () => {
    expect(fields.expiryDate).toMatch(/^\d{8} \d{6}$/);
  });

  test("it carries a base64 merchant hash", () => {
    expect(fields.merchantHashedReq).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });

  test("the order ref matches the attempt ref", () => {
    expect(fields.orderRefNum).toBe(easypaisaRef(order.reference, 1));
  });

  test("expiryStamp pads every component", () => {
    expect(expiryStamp(new Date(Date.UTC(2026, 0, 1, 22, 4, 5)))).toBe("20260102 030405");
  });
});

describe("cash on delivery", () => {
  test("needs no configuration and opens no session", () => {
    expect(cod.isConfigured()).toBe(true);
    expect(cod.createSession()).toEqual({ kind: "none" });
  });

  test("settles as not required", async () => {
    expect((await cod.verifyCallback()).status).toBe("not_required");
  });
});
