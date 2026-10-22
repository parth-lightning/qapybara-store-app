import { useLocalSearchParams, router } from "expo-router";
import { useState } from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { Page, Title, T, Button, Row, ErrorText } from "../../components/ui";
import { productById, money } from "../../lib/catalog";
import { images } from "../../lib/images";
import { useStore } from "../../lib/provider";
import { cartReducer } from "../../lib/store";
import type { CartLine } from "../../lib/schema";
export default function Detail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const p = productById(id);
  const { width } = useWindowDimensions();
  const [variant, setVariant] = useState<CartLine["variant"]>("Warm white");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const { update } = useStore();
  if (!p)
    return (
      <Page>
        <Title>Light not found</Title>
        <Button label="Back to shop" onPress={() => router.replace("/shop")} />
      </Page>
    );
  async function add() {
    if (!p) return;
    try {
      await update((s) => {
        if (!s.session) throw new Error("Please sign in.");
        return {
          ...s,
          carts: {
            ...s.carts,
            [s.session.id]: cartReducer(s.carts[s.session.id] ?? [], {
              type: "add",
              line: { productId: p.id, variant, quantity },
            }),
          },
        };
      });
      setMessage("Added to your bag.");
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Unable to save. Please try again.",
      );
    }
  }
  return (
    <Page>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) =>
          setPage(Math.round(e.nativeEvent.contentOffset.x / (width - 40)) + 1)
        }
      >
        {p.images.map((src, i) => (
          <Image
            key={src}
            source={images[src]}
            contentFit="cover"
            style={{ width: width - 40, height: width - 40 }}
            accessibilityLabel={`${p.name} image ${i + 1}`}
          />
        ))}
      </ScrollView>
      <T muted size={12}>
        {page} / {p.images.length}{" "}
        {p.images.length > 1 ? " · Swipe to explore" : ""}
      </T>
      <Row>
        <Title>{p.name}</Title>
        <T size={20}>{money(p.price)}</T>
      </Row>
      <T muted>{p.finish}</T>
      <T>{p.description}</T>
      <T size={14} muted>
        {p.dimensions}
      </T>
      <T>{p.stock ? `${p.stock} available` : "Currently out of stock"}</T>
      <T>Light temperature</T>
      <Row>
        {(["Warm white", "Soft white"] satisfies CartLine["variant"][]).map(
          (v) => (
            <Button
              label={v}
              key={v}
              secondary={variant !== v}
              id={`variant-${v.toLowerCase().replace(" ", "-")}`}
              onPress={() => setVariant(v)}
            />
          ),
        )}
      </Row>
      <Row>
        <Button
          secondary
          label="−"
          id="quantity-decrease"
          disabled={quantity <= 1}
          onPress={() => setQuantity((q) => q - 1)}
        />
        <T accessibilityLabel="quantity-value">{quantity}</T>
        <Button
          secondary
          label="+"
          id="quantity-increase"
          disabled={quantity >= p.stock}
          onPress={() => setQuantity((q) => q + 1)}
        />
      </Row>
      <Button
        label={p.stock ? "Add to bag" : "Out of stock"}
        id="add-to-cart"
        disabled={!p.stock}
        onPress={add}
      />
      <ErrorText text={message.startsWith("Added") ? "" : message} />
      {message.startsWith("Added") ? (
        <>
          <T accessibilityLiveRegion="polite">{message}</T>
          <Button
            secondary
            label="View bag"
            onPress={() => router.push("/cart")}
          />
        </>
      ) : null}
    </Page>
  );
}
