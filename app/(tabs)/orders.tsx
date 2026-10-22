import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { Page, Title, T, Button, useTheme } from "../../components/ui";
import { useStore } from "../../lib/provider";
import { money } from "../../lib/catalog";
import { shortDate } from "../../lib/dates";
export default function Orders() {
  const { state } = useStore();
  const c = useTheme();
  const orders = state.orders.filter((o) => o.userId === state.session?.id);
  return (
    <Page>
      {orders.length ? (
        orders.map((o, i) => {
          const count = o.items.reduce((n, l) => n + l.quantity, 0);
          return (
            <Pressable
              key={o.id}
              accessibilityRole="button"
              accessibilityLabel={`order-history-${i}`}
              testID={`order-history-${i}`}
              onPress={() => router.push(`/order/${o.id}`)}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
                borderWidth: 1,
                borderColor: c.border,
                borderRadius: 4,
                backgroundColor: c.elevated,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <View style={{ gap: 2 }}>
                <T style={{ fontFamily: "Manrope_600SemiBold" }}>{o.number}</T>
                <T size={13} muted>
                  {shortDate(o.createdAt)} · {count}{" "}
                  {count === 1 ? "item" : "items"}
                </T>
              </View>
              <T>{money(o.totals.total)}</T>
            </Pressable>
          );
        })
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
