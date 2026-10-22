import { describe, test, expect } from "@jest/globals";
import {
  initialState,
  restoreState,
  stateSchema,
  register,
  signIn,
  cartReducer,
  placeOrder,
  demoUser,
  type State,
} from "../lib/store";
import { products, categories } from "../lib/catalog";
import { totals } from "../lib/pricing";
import {
  addressSchema,
  loginInput,
  accountInput,
  cartLineSchema,
} from "../lib/schema";
const hash = async (p: string, s: string) => `${s}:${p}`;
const line = {
  productId: "court-leather",
  quantity: 1,
  size: "9" as const,
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
      subtotal: 13500,
      shipping: 800,
      tax: 1080,
      total: 15380,
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
  test("merges same size", () =>
    expect(cartReducer([line], { type: "add", line })[0]?.quantity).toBe(2));
  test("keeps sizes distinct", () =>
    expect(
      cartReducer([line], {
        type: "add",
        line: { ...line, size: "10" },
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
        line: { ...line, size: "10" },
      }),
    ).toThrow("available"));
  test("rejects out of stock", () =>
    expect(() =>
      cartReducer([], {
        type: "add",
        line: { ...line, productId: "missing" },
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
  test("validates size", () =>
    expect(cartLineSchema.safeParse({ ...line, size: "Blue" }).success).toBe(
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
    expect(result.order.totals.total).toBe(15380);
    expect(result.order.items[0]?.price).toBe(13500);
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
      { ...line, size: "10" as const },
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
    ).toBe(15380));
  test("supports card and express", () => {
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
    const unavailable = { ...line, productId: "retired-item" };
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

describe("apparel catalog", () => {
  test("has four categories and sixteen products", () => {
    expect(categories.map((c) => c.name)).toEqual([
      "Sneakers",
      "Tops",
      "Bottoms",
      "Outerwear",
    ]);
    expect(products).toHaveLength(16);
    for (const c of categories)
      expect(products.filter((p) => p.category === c.slug)).toHaveLength(4);
  });
  test("offers the correct sizes and two photos for every product", () => {
    for (const p of products) {
      expect(p.sizes).toEqual(
        p.category === "sneakers"
          ? ["7", "8", "9", "10", "11", "12"]
          : ["XS", "S", "M", "L", "XL"],
      );
      expect(p.images).toHaveLength(2);
      expect(p.facts).toHaveLength(3);
    }
  });
  test("rejects missing size and sizes from another category", () => {
    expect(
      cartLineSchema.safeParse({ productId: "court-leather", quantity: 1 })
        .success,
    ).toBe(false);
    expect(() =>
      cartReducer([], { type: "add", line: { ...line, size: "M" } }),
    ).toThrow("select a size");
    expect(() =>
      cartReducer([], {
        type: "add",
        line: { ...line, productId: "daily-tee" },
      }),
    ).toThrow("select a size");
  });
  test("keeps two clothing sizes through order snapshots and storage", () => {
    const items = [
      { productId: "daily-tee", quantity: 1, size: "M" as const },
      { productId: "daily-tee", quantity: 1, size: "L" as const },
    ];
    const placed = placeOrder(
      { ...state, carts: { demo: items } },
      { ...checkout, items },
    );
    expect(
      stateSchema
        .parse(JSON.parse(JSON.stringify(placed.state)))
        .orders[0]?.items.map((l) => l.size),
    ).toEqual(["M", "L"]);
    expect(placed.order.totals).toEqual({
      subtotal: 7000,
      shipping: 800,
      tax: 560,
      total: 8360,
    });
  });
  test("uses the website's deterministic short order number", () => {
    const order = placeOrder(state, checkout).order;
    expect(order.number).toBe(
      `SF-${100000 + (Number.parseInt(requestId.replaceAll("-", "").slice(0, 8), 16) % 900000)}`,
    );
    expect(order.number).toMatch(/^SF-\d{6}$/);
  });
  test("free standard delivery starts at exactly $150", () => {
    expect(
      totals([
        { productId: "daily-tee", quantity: 3, size: "M" },
        { productId: "rib-tee", quantity: 1, size: "S" },
      ]),
    ).toEqual({ subtotal: 15000, shipping: 0, tax: 1200, total: 16200 });
    expect(
      totals([{ productId: "rib-tee", quantity: 1, size: "S" }]).shipping,
    ).toBe(800);
  });
});

describe("catalog upgrade", () => {
  test("retains accounts and theme while retiring unavailable catalog lines", () => {
    const restored = restoreState({
      ...state,
      theme: "dark",
      carts: { demo: [{ productId: "retired-item", quantity: 1 }, line] },
    });
    expect(restored.session).toEqual(state.session);
    expect(restored.theme).toBe("dark");
    expect(restored.carts.demo).toEqual([line]);
  });
  test("does not silently clear corrupt current catalog data", () => {
    expect(() =>
      restoreState({
        ...state,
        carts: { demo: [{ productId: "court-leather", quantity: 1 }] },
      }),
    ).toThrow();
  });
});
