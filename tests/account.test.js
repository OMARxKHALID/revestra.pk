import { beforeEach, describe, expect, mock, test } from "bun:test";
import { ObjectId } from "mongodb";
import {
  deleteAccountSchema,
  newsletterPreferenceSchema,
  savedAddressSchema,
} from "../src/lib/schemas/account.js";

const address = {
  name: "Ayesha Khan",
  phone: "0300 1234567",
  address: "12 Zamzama Boulevard",
  apartment: "",
  city: "Karachi",
  postalCode: "75500",
  country: "Pakistan",
};

describe("account forms", () => {
  test("a saved address needs a Pakistani mobile and the usual fields", () => {
    expect(savedAddressSchema.safeParse(address).success).toBe(true);
    expect(savedAddressSchema.safeParse({ ...address, phone: "12345" }).success).toBe(false);
    expect(savedAddressSchema.safeParse({ ...address, city: "" }).success).toBe(false);
  });

  test("an address never carries an email, so it cannot change the account", () => {
    const parsed = savedAddressSchema.parse({ ...address, email: "someone@else.pk" });

    expect(parsed.email).toBeUndefined();
  });

  test("deleting needs a password and the newsletter toggle a boolean", () => {
    expect(deleteAccountSchema.safeParse({ password: "" }).success).toBe(false);
    expect(newsletterPreferenceSchema.safeParse({ subscribed: "yes" }).success).toBe(false);
    expect(newsletterPreferenceSchema.safeParse({ subscribed: true }).success).toBe(true);
  });
});

let reviews;

const collection = {
  deleteOne: async (filter) => {
    const before = reviews.length;

    reviews = reviews.filter(
      (review) => !(review.id === filter.id && review.userId === filter.userId)
    );

    return { deletedCount: before - reviews.length };
  },
};

mock.module("server-only", () => ({}));

const realDb = await import("@/lib/db");

mock.module("@/lib/db", () => ({
  ...realDb,
  isDatabaseConfigured: () => true,
  getDb: async () => ({ collection: () => collection }),
}));

const { deleteReviewForUser } = await import("@/lib/api/reviews");

beforeEach(() => {
  reviews = [
    { id: "r1", userId: "u1" },
    { id: "r2", userId: "u2" },
  ];
});

describe("deleting your own review", () => {
  test("an owner can delete theirs", async () => {
    expect((await deleteReviewForUser("r1", "u1")).ok).toBe(true);
    expect(reviews.map(({ id }) => id)).toEqual(["r2"]);
  });

  test("someone else's review is refused and left alone", async () => {
    const result = await deleteReviewForUser("r2", "u1");

    expect(result.ok).toBe(false);
    expect(reviews).toHaveLength(2);
  });

  test("a signed-out request is refused", async () => {
    expect((await deleteReviewForUser("r1", null)).ok).toBe(false);
  });

  test("ObjectId ids are not needed for reviews", () => {
    expect(ObjectId.isValid("r1")).toBe(false);
  });
});
