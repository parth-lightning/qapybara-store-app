import { Image } from "expo-image";
import { router } from "expo-router";
import { View, Pressable } from "react-native";
import { Page, Title, T, Button } from "../../components/ui";
import { Grid } from "../../components/shop";
import { categories, products } from "../../lib/catalog";
import { images } from "../../lib/images";
export default function Home() {
  return (
    <Page>
      <T size={12} muted>
        Complimentary standard delivery on orders $250 and over
      </T>
      <T size={40} style={{ letterSpacing: -1.8, lineHeight: 46 }}>
        Make room for{"\n"}good light.
      </T>
      <T muted>
        Considered lighting. Honest materials. A softer way to come home.
      </T>
      <Button
        label="Explore the collection"
        onPress={() => router.push("/shop")}
      />
      <Image
        source={images["/images/hero.webp"]}
        style={{ width: "100%", aspectRatio: 1.2 }}
        accessibilityLabel="Architectural living room with silver lamps"
      />
      <Title>A light for every corner</Title>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        {categories.map((c) => {
          const product = products.find((p) => p.category === c.slug);
          return (
            <Pressable
              key={c.slug}
              testID={`category-${c.slug}`}
              accessibilityLabel={`category-${c.slug}`}
              accessibilityRole="button"
              onPress={() => router.push(`/category/${c.slug}`)}
              style={{ width: "47%", gap: 8 }}
            >
              <Image
                source={images[product?.images[0] ?? ""]}
                style={{ width: "100%", aspectRatio: 1 }}
              />
              <T size={20}>{c.name}</T>
              <T size={12} muted>
                {c.description}
              </T>
            </Pressable>
          );
        })}
      </View>
      <Title>Start with these</Title>
      <Grid items={products.slice(0, 4)} />
      <Title>Made for everyday living</Title>
      <T muted>
        Each light includes a warm LED bulb. Choose your light temperature on
        the product page.
      </T>
      <T muted>
        Standard delivery is $8, or complimentary at $250. Express delivery is
        available at checkout.
      </T>
    </Page>
  );
}
