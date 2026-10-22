import { router } from "expo-router";
import { Page, Title, T, Button } from "../../components/ui";
import { useStore } from "../../lib/provider";
import { money } from "../../lib/catalog";
export default function Orders() {
  const { state } = useStore();
  const orders = state.orders.filter((o) => o.userId === state.session?.id);
  return (
    <Page>
      <Title>Your orders</Title>
      {orders.length ? (
        orders.map((o, i) => (
          <Button
            secondary
            key={o.id}
            id={`order-history-${i}`}
            label={`${o.id.slice(0, 11)} · ${money(o.totals.total)} · ${new Date(o.createdAt).toLocaleDateString()}`}
            onPress={() => router.push(`/order/${o.id}`)}
          />
        ))
      ) : (
        <>
          <T muted>When you find your light, your orders will appear here.</T>
          <Button
            label="Explore the collection"
            onPress={() => router.push("/shop")}
          />
        </>
      )}
    </Page>
  );
}
