import React, { useState } from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import * as Crypto from "expo-crypto";
import { z } from "zod";
import { Page, Title, T, Button, Field, ErrorText } from "./ui";
import { useStore, hashPassword } from "../lib/provider";
import { register, signIn } from "../lib/store";
import { accountInput, loginInput } from "../lib/schema";
export function Auth({ signup = false }: { signup?: boolean }) {
  const { update } = useStore();
  const { created } = useLocalSearchParams<{ created?: string }>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit() {
    const parsed = (signup ? accountInput : loginInput).safeParse({
      email: email.trim(),
      password,
      name,
    });
    setErrors({});
    setError("");
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues)
        next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setBusy(true);
    try {
      if (signup) {
        await update((s) =>
          register(s, parsed.data, Crypto.randomUUID(), hashPassword),
        );
        router.replace({ pathname: "/login", params: { created: "1" } });
      } else {
        await update((s) => signIn(s, parsed.data, hashPassword));
        router.replace("/");
      }
    } catch (e) {
      setError(
        e instanceof z.ZodError
          ? (e.issues[0]?.message ?? "Check your details.")
          : e instanceof Error
            ? e.message
            : "Unable to save. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Page>
      {!signup ? (
        <Image
          source={require("../assets/welcome.webp")}
          style={{ width: "100%", height: 180 }}
          contentFit="cover"
          accessibilityLabel="Everyday layers in a bright studio"
        />
      ) : null}
      <View>
        <Title>{signup ? "Create an account" : "Welcome back"}</Title>
        <T muted>
          {signup
            ? "Save your bag and follow your orders."
            : "Your everyday wardrobe starts here."}
        </T>
      </View>
      {created && !signup ? (
        <T accessibilityLiveRegion="polite">
          Account created. Sign in with your new details.
        </T>
      ) : null}
      {signup ? (
        <Field
          id="signup-name"
          label="Full name"
          value={name}
          onChangeText={(value) => {
            setName(value);
            setErrors((previous) => ({ ...previous, name: "" }));
            setError("");
          }}
          error={errors.name}
          autoComplete="name"
        />
      ) : null}
      <Field
        id={signup ? "signup-email" : "login-email"}
        label="Email"
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          setErrors((previous) => ({ ...previous, email: "" }));
          setError("");
        }}
        error={errors.email}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />
      <Field
        id={signup ? "signup-password" : "login-password"}
        label="Password"
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          setErrors((previous) => ({ ...previous, password: "" }));
          setError("");
        }}
        error={errors.password}
        secureTextEntry={!show}
        autoCapitalize="none"
        autoComplete={signup ? "new-password" : "current-password"}
      />
      <Button
        secondary
        label={show ? "Hide password" : "Show password"}
        id="toggle-password"
        onPress={() => setShow(!show)}
      />
      <ErrorText text={error} />
      <Button
        label={signup ? "Create account" : "Sign in"}
        id={signup ? "signup-submit" : "login-submit"}
        onPress={submit}
        busy={busy}
      />
      <Button
        secondary
        label={signup ? "Back to sign in" : "Create an account"}
        onPress={() => router.push(signup ? "/login" : "/signup")}
      />
      {signup ? (
        <T size={12} muted>
          At least 8 characters.
        </T>
      ) : null}
    </Page>
  );
}
