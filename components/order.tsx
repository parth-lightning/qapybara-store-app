import { useLocalSearchParams, router } from "expo-router";
import { Page, Title, T, Button } from "./ui";
import { Summary } from "./summary";
import { useStore } from "../lib/provider";
import { money } from "../lib/catalog";
export function OrderScreen({
  confirmation = false,
}: {
  confirmation?: boolean;
}) {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state } = useStore();
  const order = state.orders.find(
    (o) => o.id === id && o.userId === state.session?.id,
  );
  if (!order)
    return (
      <Page>
        <Title>Order not found.</Title>
        <Button label="View orders" onPress={() => router.replace("/orders")} />
      </Page>
    );
  return (
    <Page>
      <Title>
        {confirmation ? "Thank you. Good light is on its way." : "Your order"}
      </Title>
      <T muted>
        {confirmation
          ? "Your order is saved. No payment has been taken."
          : "Placed " + new Date(order.createdAt).toLocaleString()}
      </T>
      <T
        testID="order-number"
        accessibilityLabel="order-number"
        selectable
        size={14}
      >
        {order.id}
      </T>
      {order.items.map((l, i) => (
        <T key={i}>
          {l.quantity} × {l.name} · {l.variant}
          {"\n"}
          {money(l.price * l.quantity)}
        </T>
      ))}
      <Summary value={order.totals} />
      <Title>Shipping to</Title>
      <T>
        {order.address.name}
        {"\n"}
        {order.address.address}
        {"\n"}
        {order.address.city}, {order.address.region} {order.address.postal}
        {"\n"}
        {order.address.country}
        {"\n"}
        {order.address.phone}
      </T>
      <T>
        {order.delivery === "express"
          ? "Express delivery"
          : "Standard delivery"}
        {"\n"}
        {order.payment === "card"
          ? "Card (demo, no real charge)"
          : "Pay on delivery"}
      </T>
      <Button
        label="View order history"
        id="view-orders"
        onPress={() => router.replace("/orders")}
      />
      <Button
        secondary
        label="Continue shopping"
        onPress={() => router.replace("/shop")}
      />
    </Page>
  );
}
