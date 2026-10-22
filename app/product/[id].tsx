import { useLocalSearchParams, router } from "expo-router";
import { useState } from "react";
import { ScrollView, View, useWindowDimensions } from "react-native";
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
  const [size, setSize] = useState<CartLine["size"] | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const { update } = useStore();
  if (!p)
    return (
      <Page>
        <Title>Product not found</Title>
        <Button label="Back to shop" onPress={() => router.replace("/shop")} />
      </Page>
    );
  async function add() {
    if (!p) return;
    if (!size) {
      setMessage("Please select a size");
      return;
    }
    try {
      await update((s) => {
        if (!s.session) throw new Error("Please sign in.");
        return {
          ...s,
          carts: {
            ...s.carts,
            [s.session.id]: cartReducer(s.carts[s.session.id] ?? [], {
              type: "add",
              line: { productId: p.id, size, quantity },
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
    <Page
      footer={
        <>
          <ErrorText text={message.startsWith("Added") ? "" : message} />
          <Button
            label={p.stock ? "Add to bag" : "Out of stock"}
            id="add-to-cart"
            disabled={!p.stock}
            onPress={add}
          />
          {message.startsWith("Added") ? (
            <Button
              secondary
              label="View bag"
              onPress={() => router.push("/cart")}
            />
          ) : null}
        </>
      }
    >
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      >
        {p.images.map((src, i) => (
          <Image
            key={src}
            source={images[src]}
            contentFit="cover"
            style={{ width: width - 40, height: (width - 40) * 0.85 }}
            accessibilityLabel={`${p.name} image ${i + 1}`}
          />
        ))}
      </ScrollView>
      <Row>
        <View style={{ flex: 1 }}>
          <T size={24} style={{ letterSpacing: -0.6 }}>
            {p.name}
          </T>
        </View>
        <T size={20}>{money(p.price)}</T>
      </Row>
      <T muted>{p.finish}</T>
      <T>{p.description}</T>
      <T>
        {p.stock === 0
          ? "Out of stock"
          : p.stock <= 5
            ? `Only ${p.stock} left`
            : "In stock"}
      </T>
      <T>{p.category === "sneakers" ? "Size (US)" : "Size"}</T>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {p.sizes.map((value) => (
          <View key={value} style={{ minWidth: 52 }}>
            <Button
              label={value}
              secondary={size !== value}
              id={`size-${value}`}
              onPress={() => {
                setSize(value);
                setMessage("");
              }}
            />
          </View>
        ))}
      </View>
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
      <Title>Details & care</Title>
      {p.facts.map((fact) => (
        <T key={fact} size={14} muted>
          {fact}
        </T>
      ))}
    </Page>
  );
}
