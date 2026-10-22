import { useState } from "react";
import { Image } from "expo-image";
import { router } from "expo-router";
import { View } from "react-native";
import { Page, Title, T, Button, Row, ErrorText } from "../../components/ui";
import { useStore } from "../../lib/provider";
import { cartReducer, type CartAction } from "../../lib/store";
import { productById, money } from "../../lib/catalog";
import { images } from "../../lib/images";
import { totals } from "../../lib/pricing";
import { Summary } from "../../components/summary";
export default function Cart() {
  const { state, update } = useStore();
  const [error, setError] = useState("");
  const cart = state.carts[state.session?.id ?? ""] ?? [];
  async function change(action: CartAction) {
    try {
      await update((s) => {
        if (!s.session) throw new Error("Please sign in.");
        return {
          ...s,
          carts: {
            ...s.carts,
            [s.session.id]: cartReducer(s.carts[s.session.id] ?? [], action),
          },
        };
      });
      setError("");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to save. Please try again.",
      );
    }
  }
  return (
    <Page>
      {!cart.length ? (
        <>
          <Image
            source={images["/images/category-sneakers.webp"]}
            style={{ width: "100%", height: 220 }}
          />
          <Title>Your bag is empty</Title>
          <T muted>Find something you love.</T>
          <Button label="Start shopping" onPress={() => router.push("/shop")} />
        </>
      ) : (
        <>
          {cart.map((l, i) => {
            const p = productById(l.productId);
            return (
              <View key={`${l.productId}-${l.size}`} style={{ gap: 12 }}>
                <Row>
                  <Image
                    source={images[p?.images[0] ?? ""]}
                    style={{ width: 90, height: 90 }}
                  />
                  <View style={{ flex: 1 }}>
                    <T size={20}>{p?.name ?? "Unavailable item"}</T>
                    <T size={14} muted>
                      Size {l.size}
                    </T>
                    <T>{money((p?.price ?? 0) * l.quantity)}</T>
                  </View>
                </Row>
                <Row>
                  <Button
                    secondary
                    label="−"
                    id={`cart-decrease-${i}`}
                    disabled={l.quantity <= 1}
                    onPress={() =>
                      change({
                        type: "quantity",
                        ...l,
                        quantity: l.quantity - 1,
                      })
                    }
                  />
                  <T>{l.quantity}</T>
                  <Button
                    secondary
                    label="+"
                    id={`cart-increase-${i}`}
                    onPress={() =>
                      change({
                        type: "quantity",
                        ...l,
                        quantity: l.quantity + 1,
                      })
                    }
                  />
                  <Button
                    secondary
                    label="Remove"
                    id={`cart-remove-${i}`}
                    onPress={() => change({ type: "remove", ...l })}
                  />
                </Row>
              </View>
            );
          })}
          <ErrorText text={error} />
          <T muted>
            {totals(cart).subtotal >= 15000
              ? "You get free delivery."
              : `Add ${money(15000 - totals(cart).subtotal)} more for free delivery.`}
          </T>
          <Summary items={cart} />
          <Button
            label="Continue to checkout"
            id="checkout-start"
            onPress={() => router.push("/checkout")}
          />
        </>
      )}
    </Page>
  );
}
