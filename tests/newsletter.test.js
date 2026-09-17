import { describe, expect, test } from "bun:test";
import {
  signSubscriber,
  verifySubscriber,
} from "../src/lib/utils/subscriber-token.js";

const SECRET = "a-test-secret";

describe("unsubscribe links", () => {
  test("a link signed for one address does not work for another", () => {
    const token = signSubscriber("ayesha@example.com", SECRET);

    expect(verifySubscriber("ayesha@example.com", token, SECRET)).toBe(true);
    expect(verifySubscriber("bilal@example.com", token, SECRET)).toBe(false);
  });

  test("the address is matched without case or spacing", () => {
    const token = signSubscriber("Ayesha@Example.com ", SECRET);

    expect(verifySubscriber("ayesha@example.com", token, SECRET)).toBe(true);
  });

  test("a wrong secret, a missing token or a forged one is refused", () => {
    const token = signSubscriber("ayesha@example.com", SECRET);

    expect(verifySubscriber("ayesha@example.com", token, "other")).toBe(false);
    expect(verifySubscriber("ayesha@example.com", "", SECRET)).toBe(false);
    expect(verifySubscriber("ayesha@example.com", "x".repeat(token.length), SECRET)).toBe(false);
  });
});
