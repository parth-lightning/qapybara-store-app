import { useState } from "react";
import { router } from "expo-router";
import {
  Page,
  T,
  Button,
  ErrorText,
  Heading,
  Option,
} from "../../components/ui";
import { View } from "react-native";
import { useStore } from "../../lib/provider";
import type { State } from "../../lib/store";
export default function Account() {
  const { state, update } = useStore();
  const [error, setError] = useState("");
  async function theme(value: State["theme"]) {
    try {
      await update((s) => ({ ...s, theme: value }));
    } catch {
      setError("Unable to save your preference. Please try again.");
    }
  }
  return (
    <Page>
      <View>
        <T size={22}>{state.session?.name}</T>
        <T muted>{state.session?.email}</T>
      </View>
      <Heading>Appearance</Heading>
      {(["system", "light", "dark"] satisfies State["theme"][]).map((t) => (
        <Option
          key={t}
          label={
            t === "system" ? "Match phone" : t === "light" ? "Light" : "Dark"
          }
          id={`theme-${t}`}
          selected={state.theme === t}
          onPress={() => theme(t)}
        />
      ))}
      <ErrorText text={error} />
      <Button
        secondary
        label="Sign out"
        id="sign-out"
        onPress={async () => {
          try {
            await update((s) => ({ ...s, session: null }));
            router.replace("/login");
          } catch {
            setError("Unable to sign out. Please try again.");
          }
        }}
      />
    </Page>
  );
}
