import { useState } from "react";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, View } from "react-native";
import {
  Page,
  Title,
  T,
  Button,
  ErrorText,
  Stepper,
} from "../../components/ui";
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
            contentFit="cover"
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
              <View
                key={`${l.productId}-${l.size}`}
                style={{ flexDirection: "row", gap: 14 }}
              >
                <Image
                  source={images[p?.images[0] ?? ""]}
                  style={{ width: 88, height: 110 }}
                />
                <View style={{ flex: 1, gap: 8 }}>
                  <View>
                    <T size={16}>{p?.name ?? "Unavailable item"}</T>
                    <T size={13} muted>
                      {p?.finish ? `${p.finish} · ` : ""}Size {l.size}
                    </T>
                    <T size={15}>{money((p?.price ?? 0) * l.quantity)}</T>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Stepper
                      value={l.quantity}
                      max={p?.stock ?? 99}
                      onChange={(quantity) =>
                        change({ type: "quantity", ...l, quantity })
                      }
                      ids={{
                        decrease: `cart-decrease-${i}`,
                        increase: `cart-increase-${i}`,
                      }}
                    />
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`cart-remove-${i}`}
                      testID={`cart-remove-${i}`}
                      hitSlop={10}
                      onPress={() => change({ type: "remove", ...l })}
                    >
                      <T
                        size={14}
                        muted
                        style={{ textDecorationLine: "underline" }}
                      >
                        Remove
                      </T>
                    </Pressable>
                  </View>
                </View>
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
            label="Checkout"
            id="checkout-start"
            onPress={() => router.push("/checkout")}
          />
        </>
      )}
    </Page>
  );
}
