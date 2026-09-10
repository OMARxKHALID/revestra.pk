import { describe, expect, test } from "bun:test";
import easypaisa, { canInquire } from "../src/lib/payments/easypaisa.js";
import jazzcash from "../src/lib/payments/jazzcash.js";
import { buildSecureHash } from "../src/lib/payments/jazzcash-hash.js";

const easypaisaConfig = {
  storeId: "12345",
  hashKey: "N2VjNWQ3ZTNiMjJk",
  accountNum: "0987654321",
  username: "merchant",
  password: "secret",
  inquiryAction: "https://easypaystg.easypaisa.com.pk/inquire",
};

const jazzcashConfig = {
  merchantId: "MER123",
  password: "75019F19EA",
  integritySalt: "0F5DD14AE2E38C7EBD8814D29CF6F6F0",
};

const answering = (payload, ok = true) => async () => ({
  ok,
  status: ok ? 200 : 500,
  json: async () => payload,
});

describe("easypaisa callback verification", () => {
  test("a forged postback claiming success does not settle an order", async () => {
    const result = await easypaisa.verifyCallback({
      fields: { orderRefNumber: "CPMTU1BDGEKI5L1", status: "0000" },
      config: easypaisaConfig,
      fetchImpl: answering({
        responseCode: "0001",
        transactionStatus: "PENDING",
        transactionAmount: "0",
      }),
    });

    expect(result.status).toBe("failed");
  });

  test("the postback's own amount and status are never trusted", async () => {
    const result = await easypaisa.verifyCallback({
      fields: {
        orderRefNumber: "CPMTU1BDGEKI5L1",
        status: "0000",
        transactionAmount: "9999.0",
      },
      config: easypaisaConfig,
      fetchImpl: answering({
        responseCode: "0000",
        transactionStatus: "PAID",
        transactionAmount: "5600.0",
      }),
    });

    expect(result.amountCents).toBe(560000);
    expect(result.verification).toBe("server_inquiry");
  });

  test("settlement is refused when the inquiry API is not configured", async () => {
    const result = await easypaisa.verifyCallback({
      fields: { orderRefNumber: "CPMTU1BDGEKI5L1", status: "0000" },
      config: { ...easypaisaConfig, username: "", password: "" },
    });

    expect(result.ok).toBe(false);
    expect(result.verification).toBe("inquiry_unconfigured");
  });

  test("an unreachable inquiry endpoint leaves the order unverified", async () => {
    const result = await easypaisa.verifyCallback({
      fields: { orderRefNumber: "CPMTU1BDGEKI5L1", status: "0000" },
      config: easypaisaConfig,
      fetchImpl: answering({}, false),
    });

    expect(result.ok).toBe(false);
    expect(result.status).toBe("failed");
    expect(result.verification).toBe("inquiry_failed");
  });

  test("a confirmed inquiry settles and is marked as server verified", async () => {
    const result = await easypaisa.verifyCallback({
      fields: { orderRefNumber: "CPMTU1BDGEKI5L1" },
      config: easypaisaConfig,
      fetchImpl: answering({
        responseCode: "0000",
        transactionStatus: "PAID",
        transactionAmount: "5600.0",
        paymentToken: "tok_123",
      }),
    });

    expect(result.ok).toBe(true);
    expect(result.status).toBe("paid");
    expect(result.providerTxnId).toBe("tok_123");
  });

  test("the adapter stays unavailable until inquiry credentials exist", () => {
    expect(canInquire({ accountNum: "1", username: "u", password: "p" })).toBe(true);
    expect(canInquire({ accountNum: "1", username: "u", password: "" })).toBe(false);
  });
});

describe("jazzcash callback verification", () => {
  const signed = (overrides = {}) => {
    const fields = {
      pp_TxnRefNo: "CPMABC123XYZW1",
      pp_Amount: "560000",
      pp_ResponseCode: "000",
      pp_ResponseMessage: "Thank you",
      ppmpf_1: "CP-MABC123-XYZW",
      ...overrides,
    };

    return {
      ...fields,
      pp_SecureHash: buildSecureHash(fields, jazzcashConfig.integritySalt),
    };
  };

  test("a correctly signed success is accepted", async () => {
    const result = await jazzcash.verifyCallback({
      fields: signed(),
      config: jazzcashConfig,
    });

    expect(result.ok).toBe(true);
    expect(result.status).toBe("paid");
    expect(result.amountCents).toBe(560000);
  });

  test("tampering with the amount after signing is rejected", async () => {
    const result = await jazzcash.verifyCallback({
      fields: { ...signed(), pp_Amount: "1" },
      config: jazzcashConfig,
    });

    expect(result.ok).toBe(false);
    expect(result.status).toBe("failed");
  });

  test("an unsigned callback is rejected", async () => {
    const result = await jazzcash.verifyCallback({
      fields: { pp_TxnRefNo: "CPMABC123XYZW1", pp_ResponseCode: "000" },
      config: jazzcashConfig,
    });

    expect(result.ok).toBe(false);
  });
});
