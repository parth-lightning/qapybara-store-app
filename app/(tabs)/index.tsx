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
        Free delivery on orders over $150
      </T>
      <T size={40} style={{ letterSpacing: -1.8, lineHeight: 46 }}>
        Made for every day.
      </T>
      <T muted>Sneakers and clothes you’ll wear on repeat.</T>
      <Button label="Shop now" onPress={() => router.push("/shop")} />
      <Image
        source={images["/images/hero-apparel.webp"]}
        style={{ width: "100%", aspectRatio: 1.2 }}
        accessibilityLabel="Everyday sneakers and layers"
      />
      <Title>Shop by category</Title>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        {categories.map((c) => {
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
                source={images[c.image]}
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
      <Title>Bestsellers</Title>
      <Grid items={products.slice(0, 4)} />
    </Page>
  );
}
