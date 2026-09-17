import { beforeEach, describe, expect, mock, test } from "bun:test";
import { ObjectId } from "mongodb";

let users;

const idOf = (user) => String(user._id);

const collection = {
  findOne: async ({ _id }) => users.find((user) => String(user._id) === String(_id)) ?? null,
  countDocuments: async ({ role }) => users.filter((user) => user.role === role).length,
  updateOne: async ({ _id }, { $set }) => {
    Object.assign(users.find((user) => String(user._id) === String(_id)), $set);
  },
};

mock.module("server-only", () => ({}));
const realDb = await import("@/lib/db");

mock.module("@/lib/db", () => ({
  ...realDb,
  getDb: async () => ({ collection: () => collection }),
}));

const { setCustomerRole } = await import("@/lib/api/admin/customers");

beforeEach(() => {
  users = [
    { _id: new ObjectId(), role: "admin" },
    { _id: new ObjectId(), role: "customer" },
  ];
});

describe("admin roles", () => {
  test("an admin can promote a customer", async () => {
    const [admin, customer] = users;
    const result = await setCustomerRole({ userId: idOf(customer), role: "admin", actingAdminId: idOf(admin) });

    expect(result.ok).toBe(true);
    expect(customer.role).toBe("admin");
  });

  test("an admin cannot change their own role", async () => {
    const [admin] = users;
    const result = await setCustomerRole({ userId: idOf(admin), role: "customer", actingAdminId: idOf(admin) });

    expect(result.ok).toBe(false);
    expect(admin.role).toBe("admin");
  });

  test("the last admin cannot be removed", async () => {
    const [admin, customer] = users;
    const result = await setCustomerRole({ userId: idOf(admin), role: "customer", actingAdminId: idOf(customer) });

    expect(result.ok).toBe(false);
    expect(result.error).toContain("at least one admin");
  });

  test("with two admins, one can be removed", async () => {
    const [admin, other] = users;
    other.role = "admin";
    const result = await setCustomerRole({ userId: idOf(other), role: "customer", actingAdminId: idOf(admin) });

    expect(result.ok).toBe(true);
    expect(other.role).toBe("customer");
  });
});
