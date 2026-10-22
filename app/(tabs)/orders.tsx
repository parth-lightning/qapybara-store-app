import { router } from "expo-router";
import { Page, Title, T, Button } from "../../components/ui";
import { useStore } from "../../lib/provider";
import { money } from "../../lib/catalog";
export default function Orders() {
  const { state } = useStore();
  const orders = state.orders.filter((o) => o.userId === state.session?.id);
  return (
    <Page>
      {orders.length ? (
        orders.map((o, i) => (
          <Button
            secondary
            key={o.id}
            id={`order-history-${i}`}
            label={`${o.number} · ${money(o.totals.total)} · ${new Date(o.createdAt).toLocaleDateString()}`}
            onPress={() => router.push(`/order/${o.id}`)}
          />
        ))
      ) : (
        <>
          <Title>No orders yet</Title>
          <T muted>Your orders will appear here.</T>
          <Button label="Start shopping" onPress={() => router.push("/shop")} />
        </>
      )}
    </Page>
  );
}
