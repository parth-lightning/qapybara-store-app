import { productById } from "./catalog";
import type { CartLine } from "./schema";
export function totals(
  items: CartLine[],
  delivery: "standard" | "express" = "standard",
) {
  const subtotal = items.reduce(
    (sum, item) =>
      sum + (productById(item.productId)?.price ?? 0) * item.quantity,
    0,
  );
  const shipping =
    subtotal === 0
      ? 0
      : delivery === "express"
        ? 1800
        : subtotal >= 25000
          ? 0
          : 800;
  const tax = Math.round((subtotal * 8) / 100);
  return { subtotal, shipping, tax, total: subtotal + shipping + tax };
}
