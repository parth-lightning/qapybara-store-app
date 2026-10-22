import { z } from "zod";
import {
  accountInput,
  loginInput,
  cartLineSchema,
  checkoutSchema,
  orderSchema,
  userSchema,
  type User,
  type CartLine,
  type Order,
} from "./schema";
import { productById } from "./catalog";
import { totals } from "./pricing";
export const credentialSchema = userSchema.extend({
  salt: z.string(),
  hash: z.string(),
});
export const stateSchema = z.object({
  accounts: z.array(credentialSchema),
  session: userSchema.nullable(),
  carts: z.record(z.string(), z.array(cartLineSchema)),
  orders: z.array(orderSchema),
  theme: z.enum(["system", "light", "dark"]),
});
export type State = z.infer<typeof stateSchema>;
export const initialState: State = {
  accounts: [],
  session: null,
  carts: {},
  orders: [],
  theme: "system",
};
// Retire the previous catalog while retaining local accounts and appearance.
const savedStateSchema = stateSchema.extend({
  carts: z.record(z.string(), z.array(z.unknown())),
  orders: z.array(z.unknown()),
});
export function restoreState(value: unknown): State {
  if (value === null) return initialState;
  const saved = savedStateSchema.parse(value);
  const carts = Object.fromEntries(
    Object.entries(saved.carts).map(([id, lines]) => [
      id,
      lines
        .filter((line) => {
          const identity = z.object({ productId: z.string() }).parse(line);
          return !!productById(identity.productId);
        })
        .map((line) => cartLineSchema.parse(line)),
    ]),
  );
  const orders = saved.orders
    .filter((order) => {
      const identity = z
        .object({ items: z.array(z.object({ productId: z.string() })) })
        .parse(order);
      return identity.items.every((line) => !!productById(line.productId));
    })
    .map((order) => orderSchema.parse(order));
  return stateSchema.parse({ ...saved, carts, orders });
}
export const demoUser: User = {
  id: "demo",
  email: "demo@qapybara.dev",
  name: "Alex Morgan",
};
export type Hasher = (password: string, salt: string) => Promise<string>;
export async function register(
  state: State,
  input: unknown,
  id: string,
  hash: Hasher,
): Promise<State> {
  const data = accountInput.parse(input);
  if (
    data.email === demoUser.email ||
    state.accounts.some((a) => a.email === data.email)
  )
    throw new Error("An account with this email already exists.");
  const user = { id, email: data.email, name: data.name };
  return {
    ...state,
    accounts: [
      ...state.accounts,
      { ...user, salt: id, hash: await hash(data.password, id) },
    ],
  };
}
export async function signIn(
  state: State,
  input: unknown,
  hash: Hasher,
): Promise<State> {
  const { email, password } = loginInput.parse(input);
  if (email === demoUser.email && password === "Demo1234!")
    return { ...state, session: demoUser };
  const account = state.accounts.find((a) => a.email === email);
  if (!account || account.hash !== (await hash(password, account.salt)))
    throw new Error("Email or password is incorrect.");
  return { ...state, session: userSchema.parse(account) };
}
export type CartAction =
  | { type: "add"; line: CartLine }
  | {
      type: "quantity";
      productId: string;
      size: CartLine["size"];
      quantity: number;
    }
  | { type: "remove"; productId: string; size: CartLine["size"] };
export function cartReducer(cart: CartLine[], action: CartAction): CartLine[] {
  const line =
    action.type === "add" ? cartLineSchema.parse(action.line) : action;
  const match = (l: CartLine) =>
    l.productId === line.productId && l.size === line.size;
  if (action.type === "remove") return cart.filter((l) => !match(l));
  const old = cart.find(match)?.quantity ?? 0;
  if (action.type === "quantity" && !old) return cart;
  const product = productById(line.productId);
  if (!product) throw new Error("This item is no longer available.");
  if (!product.sizes.includes(line.size))
    throw new Error("Please select a size");
  const quantity =
    action.type === "add" ? old + action.line.quantity : action.quantity;
  const other = cart
    .filter((l) => l.productId === line.productId && !match(l))
    .reduce((n, l) => n + l.quantity, 0);
  if (
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 99 ||
    quantity + other > product.stock
  )
    throw new Error("The quantity exceeds available stock.");
  if (!old && cart.length >= 32)
    throw new Error("Your bag can hold up to 32 different items.");
  return old
    ? cart.map((l) => (match(l) ? { ...l, quantity } : l))
    : [...cart, cartLineSchema.parse({ ...line, quantity })];
}
export function placeOrder(
  state: State,
  input: unknown,
  now = new Date().toISOString(),
): { state: State; order: Order } {
  if (!state.session) throw new Error("Please sign in again.");
  const data = checkoutSchema.parse(input);
  const id = data.requestId;
  const existing = state.orders.find(
    (o) => o.id === id && o.userId === state.session?.id,
  );
  if (existing) return { state, order: existing };
  const cart = state.carts[state.session.id] ?? [];
  if (JSON.stringify(cart) !== JSON.stringify(data.items))
    throw new Error("Your bag has changed. Please review it again.");
  const counts = new Map<string, number>();
  const items = data.items.map((line) => {
    const p = productById(line.productId);
    const count = (counts.get(line.productId) ?? 0) + line.quantity;
    counts.set(line.productId, count);
    if (!p || !p.sizes.includes(line.size) || count > p.stock)
      throw new Error(
        "One or more items exceed available stock. Please update your bag.",
      );
    return { ...line, name: p.name, price: p.price, image: p.images[0] ?? "" };
  });
  const order: Order = {
    id,
    number: `SF-${100000 + (Number.parseInt(data.requestId.replaceAll("-", "").slice(0, 8), 16) % 900000)}`,
    userId: state.session.id,
    createdAt: now,
    items,
    address: data.address,
    delivery: data.delivery,
    payment: data.payment,
    totals: totals(data.items, data.delivery),
  };
  return {
    order,
    state: {
      ...state,
      carts: { ...state.carts, [state.session.id]: [] },
      orders: [order, ...state.orders],
    },
  };
}
