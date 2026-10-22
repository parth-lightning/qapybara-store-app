import { describe, test, expect } from "@jest/globals";
import {
  initialState,
  stateSchema,
  register,
  signIn,
  cartReducer,
  placeOrder,
  demoUser,
  type State,
} from "../lib/store";
import { totals } from "../lib/pricing";
import {
  addressSchema,
  loginInput,
  accountInput,
  cartLineSchema,
} from "../lib/schema";
const hash = async (p: string, s: string) => `${s}:${p}`;
const line = {
  productId: "dome-table",
  quantity: 1,
  variant: "Warm white" as const,
};
const address = {
  name: "Alex Morgan",
  address: "123 Main Street",
  city: "Portland",
  region: "Oregon",
  postal: "97201",
  phone: "5035550100",
  country: "United States",
};
const requestId = "e6426eba-77f0-4f57-9334-e850b17a1c09";
const state: State = {
  ...initialState,
  session: demoUser,
  carts: { demo: [line] },
};
const checkout = {
  items: [line],
  address,
  delivery: "standard",
  payment: "delivery",
  requestId,
};
describe("pricing", () => {
  test("empty bag has no charges", () =>
    expect(totals([])).toEqual({ subtotal: 0, shipping: 0, tax: 0, total: 0 }));
  test("standard below threshold", () =>
    expect(totals([line])).toEqual({
      subtotal: 18900,
      shipping: 800,
      tax: 1512,
      total: 21212,
    }));
  test("free standard over threshold", () =>
    expect(totals([{ ...line, quantity: 2 }]).shipping).toBe(0));
  test("express remains paid", () =>
    expect(totals([{ ...line, quantity: 2 }], "express").shipping).toBe(1800));
  test("integer tax", () =>
    expect(Number.isInteger(totals([line]).tax)).toBe(true));
});
describe("cart reducer", () => {
  test("adds a line", () =>
    expect(cartReducer([], { type: "add", line })).toEqual([line]));
  test("merges same variant", () =>
    expect(cartReducer([line], { type: "add", line })[0]?.quantity).toBe(2));
  test("keeps variants distinct", () =>
    expect(
      cartReducer([line], {
        type: "add",
        line: { ...line, variant: "Soft white" },
      }),
    ).toHaveLength(2));
  test("changes quantity", () =>
    expect(
      cartReducer([line], { type: "quantity", ...line, quantity: 3 })[0]
        ?.quantity,
    ).toBe(3));
  test("removes", () =>
    expect(cartReducer([line], { type: "remove", ...line })).toEqual([]));
  test("rejects combined stock overflow", () =>
    expect(() =>
      cartReducer([{ ...line, quantity: 12 }], {
        type: "add",
        line: { ...line, variant: "Soft white" },
      }),
    ).toThrow("available"));
  test("rejects out of stock", () =>
    expect(() =>
      cartReducer([], {
        type: "add",
        line: { ...line, productId: "fold-floor" },
      }),
    ).toThrow());
  test("rejects invalid quantities", () =>
    expect(() =>
      cartReducer([line], { type: "quantity", ...line, quantity: 0 }),
    ).toThrow());
  test("rejects missing products", () =>
    expect(() =>
      cartReducer([], { type: "add", line: { ...line, productId: "missing" } }),
    ).toThrow());
});
describe("validation", () => {
  test("valid US address", () =>
    expect(addressSchema.safeParse(address).success).toBe(true));
  test.each(["", "123", "abcde"])("invalid ZIP %s", (postal) =>
    expect(addressSchema.safeParse({ ...address, postal }).success).toBe(false),
  );
  test("rejects short phone", () =>
    expect(
      addressSchema.safeParse({ ...address, phone: "1234567" }).success,
    ).toBe(false));
  test("accepts US country code", () =>
    expect(
      addressSchema.safeParse({ ...address, phone: "+1 (503) 555-0100" })
        .success,
    ).toBe(true));
  test("requires email", () =>
    expect(
      loginInput.safeParse({ email: "x", password: "12345678" }).success,
    ).toBe(false));
  test("requires password length", () =>
    expect(
      accountInput.safeParse({
        name: "Alex",
        email: "a@b.com",
        password: "short",
      }).success,
    ).toBe(false));
  test("validates variant", () =>
    expect(cartLineSchema.safeParse({ ...line, variant: "Blue" }).success).toBe(
      false,
    ));
});
describe("auth store", () => {
  test("demo signs in", async () =>
    expect(
      (
        await signIn(
          initialState,
          { email: demoUser.email, password: "Demo1234!" },
          hash,
        )
      ).session,
    ).toEqual(demoUser));
  test("rejects wrong password", async () =>
    expect(
      signIn(
        initialState,
        { email: demoUser.email, password: "wrong123" },
        hash,
      ),
    ).rejects.toThrow("incorrect"));
  test("signup then login, normalized email", async () => {
    const next = await register(
      initialState,
      {
        name: "Taylor Reed",
        email: "TAYLOR@example.com",
        password: "Password123",
      },
      "taylor",
      hash,
    );
    expect(next.session).toBeNull();
    expect(
      (
        await signIn(
          next,
          { email: "taylor@example.com", password: "Password123" },
          hash,
        )
      ).session?.name,
    ).toBe("Taylor Reed");
  });
  test("rejects demo duplicate", async () =>
    expect(
      register(
        initialState,
        { name: "Alex", email: demoUser.email, password: "Password123" },
        "x",
        hash,
      ),
    ).rejects.toThrow("already exists"));
  test("rejects account duplicate", async () => {
    const input = { name: "Taylor", email: "t@e.com", password: "Password123" };
    const next = await register(initialState, input, "x", hash);
    await expect(register(next, input, "y", hash)).rejects.toThrow(
      "already exists",
    );
  });
  test("signout preserves user bags", () =>
    expect({ ...state, session: null }.carts.demo).toEqual([line]));
});
describe("order placement", () => {
  test("creates snapshot and clears only own cart", () => {
    const result = placeOrder(
      { ...state, carts: { ...state.carts, other: [line] } },
      checkout,
    );
    expect(result.order.totals.total).toBe(21212);
    expect(result.order.items[0]?.price).toBe(18900);
    expect(result.state.carts.demo).toEqual([]);
    expect(result.state.carts.other).toEqual([line]);
  });
  test("requires session", () =>
    expect(() => placeOrder(initialState, checkout)).toThrow("sign in"));
  test("rejects empty", () =>
    expect(() => placeOrder(state, { ...checkout, items: [] })).toThrow());
  test("revalidates combined stock", () => {
    const items = [
      { ...line, quantity: 12 },
      { ...line, variant: "Soft white" as const },
    ];
    expect(() =>
      placeOrder({ ...state, carts: { demo: items } }, { ...checkout, items }),
    ).toThrow("stock");
  });
  test("revalidates address", () =>
    expect(() =>
      placeOrder(state, { ...checkout, address: { ...address, postal: "x" } }),
    ).toThrow());
  test("rejects changed bag", () =>
    expect(() =>
      placeOrder(state, { ...checkout, items: [{ ...line, quantity: 2 }] }),
    ).toThrow("changed"));
  test("idempotent retry", () => {
    const first = placeOrder(state, checkout);
    const second = placeOrder(first.state, checkout);
    expect(second.state.orders).toHaveLength(1);
    expect(second.order.id).toBe(first.order.id);
  });
  test("recomputes prices, ignores supplied totals", () =>
    expect(
      placeOrder(state, { ...checkout, totals: { total: 0 } }).order.totals
        .total,
    ).toBe(21212));
  test("supports demo card and express", () => {
    const result = placeOrder(state, {
      ...checkout,
      payment: "card",
      delivery: "express",
    });
    expect(result.order.payment).toBe("card");
    expect(result.order.totals.shipping).toBe(1800);
  });
});

describe("persistence boundaries", () => {
  test("registered credentials survive storage round trip", async () => {
    const created = await register(
      initialState,
      {
        name: "Taylor Reed",
        email: "persist@example.com",
        password: "Password123",
      },
      "persist",
      hash,
    );
    const restored = stateSchema.parse(JSON.parse(JSON.stringify(created)));
    expect(
      (
        await signIn(
          restored,
          { email: "persist@example.com", password: "Password123" },
          hash,
        )
      ).session?.id,
    ).toBe("persist");
  });
  test("session, orders and separate bags survive storage round trip", () => {
    const placed = placeOrder(
      { ...state, carts: { ...state.carts, other: [line] } },
      checkout,
    ).state;
    const restored = stateSchema.parse(JSON.parse(JSON.stringify(placed)));
    expect(restored.session).toEqual(demoUser);
    expect(restored.orders).toHaveLength(1);
    expect(restored.carts.demo).toEqual([]);
    expect(restored.carts.other).toEqual([line]);
  });
});

describe("cart recovery", () => {
  test("removes a saved line that no longer exists in the catalog", () => {
    const unavailable = { ...line, productId: "retired-light" };
    expect(
      cartReducer([unavailable], { type: "remove", ...unavailable }),
    ).toEqual([]);
  });
  test("a delayed quantity action cannot restore a removed line", () => {
    const removed = cartReducer([line], { type: "remove", ...line });
    expect(
      cartReducer(removed, { type: "quantity", ...line, quantity: 2 }),
    ).toEqual([]);
  });
});
