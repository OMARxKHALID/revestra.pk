import { describe, expect, test } from "bun:test";
import { refundSchema, REFUND_METHODS } from "../src/lib/schemas/admin.js";

describe("refund entries", () => {
  test("amount and method are required, the rest is optional", () => {
    expect(refundSchema.safeParse({ amount: "1500", method: "bank_transfer" }).success).toBe(true);
    expect(refundSchema.safeParse({ amount: "0", method: "cash" }).success).toBe(false);
    expect(refundSchema.safeParse({ amount: "100", method: "cheque" }).success).toBe(false);
  });

  test("every method has a label", () => {
    expect(Object.keys(REFUND_METHODS)).toEqual(["original", "bank_transfer", "wallet", "cash"]);
  });
});
