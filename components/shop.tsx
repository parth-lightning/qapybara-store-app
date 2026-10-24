import React, { useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Page, Title, T, Button, Field, ErrorText } from "./ui";
import { categories, money, products, type Product } from "../lib/catalog";
import { images } from "../lib/images";
export function ProductCard({ product: p }: { product: Product }) {
  return (
    <View style={{ width: "48%", gap: 8, marginBottom: 16 }}>
      <Pressable
        accessibilityRole="button"
        testID={`product-${p.id}`}
        accessibilityLabel={`product-${p.id}`}
        onPress={() => router.push(`/product/${p.id}`)}
        style={{ gap: 8 }}
      >
        <Image
          source={images[p.images[0] ?? ""]}
          style={{ width: "100%", aspectRatio: 4 / 5 }}
          contentFit="cover"
          accessibilityLabel={`${p.name} ${p.finish}`}
        />
        <View>
          <T size={15}>{p.name}</T>
          <T size={13} muted>
            {p.finish}
          </T>
          <T size={15}>{money(p.price)}</T>
        </View>
      </Pressable>
    </View>
  );
}
export function Grid({ items }: { items: Product[] }) {
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
      }}
    >
      {items.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </View>
  );
}
export function Listing({ category = "" }: { category?: string }) {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState(category);
  const [sort, setSort] = useState("newest");
  const [minimum, setMinimum] = useState("");
  const [maximum, setMaximum] = useState("");
  const [filters, setFilters] = useState(false);
  const valid =
    (!minimum || (Number.isFinite(Number(minimum)) && Number(minimum) >= 0)) &&
    (!maximum || (Number.isFinite(Number(maximum)) && Number(maximum) >= 0)) &&
    (!minimum || !maximum || Number(minimum) <= Number(maximum));
  const items = products
    .filter(
      (p) =>
        (!cat || p.category === cat) &&
        p.name.includes(search.trim()) &&
        (!minimum || p.price >= Number(minimum) * 100) &&
        (!maximum || p.price <= Number(maximum) * 100),
    )
    .sort((a, b) =>
      sort === "low"
        ? a.price - b.price
        : sort === "high"
          ? b.price - a.price
          : b.added - a.added,
    );
  return (
    <Page>
      {category ? (
        <View>
          <Title>{categories.find((c) => c.slug === category)?.name}</Title>
          <T muted>
            {categories.find((c) => c.slug === category)?.description}
          </T>
        </View>
      ) : null}
      <Field
        label="Search"
        placeholder="Sneakers, tees, jackets"
        id="search-products"
        value={search}
        onChangeText={setSearch}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {[{ slug: "", name: "All" }, ...categories].map((c) => (
          <Button
            key={c.slug}
            label={c.name}
            secondary={cat !== c.slug}
            id={`filter-${c.slug || "all"}`}
            onPress={() => setCat(c.slug)}
          />
        ))}
      </ScrollView>
      <Button
        secondary
        label={filters ? "Hide filters" : "Sort and filter"}
        id="show-filters"
        onPress={() => setFilters(!filters)}
      />
      {filters ? (
        <>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {[
              ["newest", "Newest"],
              ["low", "Price: low to high"],
              ["high", "Price: high to low"],
            ].map(([value, label]) => (
              <Button
                key={value}
                label={label ?? ""}
                secondary={sort !== value}
                onPress={() => setSort(value ?? "newest")}
              />
            ))}
          </View>
          <Field
            id="price-min"
            label="Min price ($)"
            keyboardType="numeric"
            value={minimum}
            onChangeText={setMinimum}
          />
          <Field
            id="price-max"
            label="Max price ($)"
            keyboardType="numeric"
            value={maximum}
            onChangeText={setMaximum}
          />
          {!valid ? <ErrorText text="Enter a valid price range." /> : null}
        </>
      ) : null}
      <T size={14} muted>
        {valid ? items.length : 0}{" "}
        {valid && items.length === 1 ? "product" : "products"}
      </T>
      {valid && items.length ? (
        <Grid items={items} />
      ) : (
        <>
          <Title>Nothing found</Title>
          <T muted>Try another search or a wider price range.</T>
          <Button
            label="Clear filters"
            onPress={() => {
              setSearch("");
              setCat("");
              setMinimum("");
              setMaximum("");
            }}
          />
        </>
      )}
    </Page>
  );
}
