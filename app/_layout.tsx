import React from "react";
import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Manrope_400Regular,
  Manrope_600SemiBold,
} from "@expo-google-fonts/manrope";
import { Provider, useStore } from "../lib/provider";
import { Button, T, useTheme } from "../components/ui";
export default function Layout() {
  return (
    <Provider>
      <Root />
    </Provider>
  );
}
function Root() {
  const { ready, error, retry, state } = useStore();
  const c = useTheme();
  const [fonts, fontError] = useFonts({
    Manrope_400Regular,
    Manrope_600SemiBold,
  });
  if (!ready || !fonts)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: c.background,
          justifyContent: "center",
          padding: 24,
          gap: 20,
        }}
      >
        {error || fontError ? (
          <>
            <T>{error || "Unable to load fonts. Please restart Stillform."}</T>
            <Button label="Retry" onPress={retry} />
          </>
        ) : (
          <>
            <ActivityIndicator color={c.accent} />
            <T>Preparing Stillform...</T>
          </>
        )}
      </View>
    );
  return (
    <>
      <StatusBar style={c.background === "#171e1e" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: c.background },
          headerTintColor: c.text,
          headerTitleStyle: { fontFamily: "Manrope_600SemiBold" },
          contentStyle: { backgroundColor: c.background },
          animation: "none",
        }}
      >
        <Stack.Protected guard={!state.session}>
          <Stack.Screen
            name="login"
            options={{ title: "stillform", headerBackVisible: false }}
          />
          <Stack.Screen name="signup" options={{ title: "stillform" }} />
        </Stack.Protected>
        <Stack.Protected guard={!!state.session}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="product/[id]" options={{ title: "" }} />
          <Stack.Screen name="category/[slug]" options={{ title: "" }} />
          <Stack.Screen name="checkout" options={{ title: "Checkout" }} />
          <Stack.Screen
            name="confirmation"
            options={{ title: "", headerBackVisible: false }}
          />
          <Stack.Screen name="order/[id]" options={{ title: "Order" }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}
