import { useState } from "react";
import { router } from "expo-router";
import { Page, Title, T, Button, ErrorText } from "../../components/ui";
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
      <Title>At home with Stillform</Title>
      <T>
        {state.session?.name}
        {"\n"}
        {state.session?.email}
      </T>
      <Title>Appearance</Title>
      {(["system", "light", "dark"] satisfies State["theme"][]).map((t) => (
        <Button
          key={t}
          label={
            t === "system" ? "Follow system" : t === "light" ? "Light" : "Dark"
          }
          id={`theme-${t}`}
          secondary={state.theme !== t}
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
      <T size={12} muted>
        QApybara demonstration store. Works offline. USD · United States. No
        real payments or deliveries.
      </T>
    </Page>
  );
}
