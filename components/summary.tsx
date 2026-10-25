import { View } from "react-native";
import { T, Row } from "./ui";
import { money } from "../lib/catalog";
import { totals } from "../lib/pricing";
import type { CartLine } from "../lib/schema";
export function Summary({
  items,
  delivery = "standard",
  value,
}: {
  items?: CartLine[];
  delivery?: "standard" | "express";
  value?: ReturnType<typeof totals>;
}) {
  const base = value ?? totals(items ?? [], delivery);
  // Show tax on the full amount the shopper pays, delivery included.
  const tax = value
    ? base.tax
    : Math.round(((base.subtotal + base.shipping) * 8) / 100);
  const t = { ...base, tax, total: base.subtotal + base.shipping + tax };
  return (
    <View style={{ gap: 12 }}>
      {[
        ["Subtotal", t.subtotal],
        ["Delivery", t.shipping],
        ["Tax (8%)", t.tax],
        ["Total", t.total],
      ].map(([label, amount]) => (
        <Row key={label}>
          <T size={label === "Total" ? 20 : 14}>{label}</T>
          <T size={label === "Total" ? 20 : 14}>
            {label === "Delivery" && amount === 0
              ? "Free"
              : money(Number(amount))}
          </T>
        </Row>
      ))}
    </View>
  );
}
