import { useLocalSearchParams, router } from "expo-router";
import { View } from "react-native";
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
      <View style={{ gap: 8 }}>
        {confirmation ? <Title>Thanks for your order</Title> : null}
        <T muted>
          {confirmation
            ? `We'll email you when it ships, ${order.address.name.split(" ")[0]}.`
            : "Placed " + new Date(order.createdAt).toLocaleString()}
        </T>
        <T
          testID="order-number"
          accessibilityLabel="order-number"
          selectable
          size={confirmation ? 14 : 28}
        >
          {order.number}
        </T>
      </View>
      <View style={{ gap: 12 }}>
        {order.items.map((l, i) => (
          <T key={i}>
            {l.quantity} × {l.name} · Size {l.size}
            {"\n"}
            {money(l.price * l.quantity)}
          </T>
        ))}
      </View>
      <Summary value={order.totals} />
      <View style={{ gap: 8 }}>
        <T size={20}>Shipping to</T>
        <T size={14}>
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
      </View>
      <T size={14}>
        {order.delivery === "express"
          ? "Express delivery, 1 to 2 days"
          : "Standard delivery, 4 to 6 days"}
        {"\n"}
        {order.payment === "card" ? "Card" : "Pay on delivery"}
      </T>
      <View style={{ gap: 12 }}>
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
      </View>
    </Page>
  );
}
