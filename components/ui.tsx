import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  type ScrollViewInstance,
  Text,
  TextInput,
  View,
  useColorScheme,
  type TextInputProps,
  type TextProps,
} from "react-native";
import { useHeaderHeight } from "expo-router/react-navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, ReduceMotion } from "react-native-reanimated";
import { tokens } from "../design/tokens";
import { useStore } from "../lib/provider";
export function useTheme() {
  const { state } = useStore();
  const system = useColorScheme();
  return tokens.colors[
    state.theme === "system"
      ? system === "dark"
        ? "dark"
        : "light"
      : state.theme
  ];
}
export function T({
  children,
  size = 16,
  muted = false,
  style,
  ...rest
}: TextProps & { size?: number; muted?: boolean }) {
  const c = useTheme();
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: "Manrope_400Regular",
          fontSize: size,
          lineHeight: size * 1.45,
          color: muted ? c.muted : c.text,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
export function Title({ children }: { children: React.ReactNode }) {
  return (
    <T size={28} style={{ letterSpacing: -1, marginBottom: 8 }}>
      {children}
    </T>
  );
}
export function Button({
  label,
  onPress,
  id,
  secondary = false,
  disabled = false,
  busy = false,
}: {
  label: string;
  onPress: () => void;
  id?: string;
  secondary?: boolean;
  disabled?: boolean;
  busy?: boolean;
}) {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={id ?? label}
      testID={id}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 48,
        minWidth: 48,
        borderRadius: 4,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: secondary ? c.border : c.accent,
        backgroundColor: secondary ? c.background : c.accent,
        opacity: disabled ? 0.45 : pressed ? 0.7 : 1,
        alignItems: "center",
        justifyContent: "center",
      })}
    >
      {busy ? (
        <ActivityIndicator color={secondary ? c.text : c.onAccent} />
      ) : (
        <T
          style={{
            color: secondary ? c.text : c.onAccent,
            fontFamily: "Manrope_600SemiBold",
          }}
        >
          {label}
        </T>
      )}
    </Pressable>
  );
}
export function Field({
  label,
  error,
  id,
  hint,
  action,
  ...props
}: TextInputProps & {
  label: string;
  error?: string;
  id: string;
  hint?: string;
  action?: { label: string; id: string; onPress: () => void };
}) {
  const c = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <T size={14}>{label}</T>
      <View style={{ justifyContent: "center" }}>
        <TextInput
          {...props}
          testID={id}
          accessibilityLabel={id}
          placeholderTextColor={c.muted}
          style={{
            fontFamily: "Manrope_400Regular",
            fontSize: 16,
            color: c.text,
            borderWidth: 1,
            borderColor: error ? c.error : c.border,
            borderRadius: 4,
            backgroundColor: c.elevated,
            minHeight: 50,
            padding: 12,
            paddingRight: action ? 72 : 12,
          }}
        />
        {action ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={action.id}
            testID={action.id}
            onPress={action.onPress}
            hitSlop={8}
            style={{ position: "absolute", right: 12, padding: 4 }}
          >
            <T size={14} style={{ fontFamily: "Manrope_600SemiBold" }}>
              {action.label}
            </T>
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <ErrorText text={error} />
      ) : hint ? (
        <T size={12} muted>
          {hint}
        </T>
      ) : null}
    </View>
  );
}
export function Heading({ children }: { children: React.ReactNode }) {
  return (
    <T size={18} style={{ fontFamily: "Manrope_600SemiBold" }}>
      {children}
    </T>
  );
}
/** A selectable row with a radio dot, used for delivery, payment and theme choices. */
export function Option({
  label,
  detail,
  selected,
  onPress,
  id,
}: {
  label: string;
  detail?: string;
  selected: boolean;
  onPress: () => void;
  id?: string;
}) {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={id ?? label}
      testID={id}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        minHeight: 56,
        padding: 14,
        borderRadius: 4,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? c.accent : c.border,
        backgroundColor: c.elevated,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          borderWidth: 2,
          borderColor: selected ? c.accent : c.muted,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {selected ? (
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: c.accent,
            }}
          />
        ) : null}
      </View>
      <View style={{ flex: 1 }}>
        <T>{label}</T>
        {detail ? (
          <T size={13} muted>
            {detail}
          </T>
        ) : null}
      </View>
    </Pressable>
  );
}
/** Compact − n + control in a single bordered box. */
export function Stepper({
  value,
  onChange,
  min = 1,
  max = 99,
  ids,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  ids: { decrease: string; increase: string; value?: string };
}) {
  const c = useTheme();
  const step = (label: string, id: string, next: number, disabled: boolean) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={id}
      testID={id}
      disabled={disabled}
      onPress={() => onChange(next)}
      style={{
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.35 : 1,
      }}
    >
      <T size={18}>{label}</T>
    </Pressable>
  );
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        borderWidth: 1,
        borderColor: c.border,
        borderRadius: 4,
      }}
    >
      {step("−", ids.decrease, value - 1, value <= min)}
      <T
        accessibilityLabel={ids.value}
        style={{ minWidth: 28, textAlign: "center" }}
      >
        {value}
      </T>
      {step("+", ids.increase, value + 1, value >= max)}
    </View>
  );
}
export function ErrorText({ text }: { text: string }) {
  const c = useTheme();
  return text ? (
    <T accessibilityRole="alert" style={{ color: c.error }} size={14}>
      {text}
    </T>
  ) : null;
}
export function Page({
  children,
  scrollRef,
  footer,
}: {
  children: React.ReactNode;
  scrollRef?: React.RefObject<ScrollViewInstance | null>;
  footer?: React.ReactNode;
}) {
  const c = useTheme();
  const headerHeight = useHeaderHeight();
  return (
    <SafeAreaView
      edges={["left", "right", "bottom"]}
      style={{ flex: 1, backgroundColor: c.background }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={headerHeight}
      >
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 36 }}
        >
          <Animated.View
            entering={FadeIn.duration(220).reduceMotion(ReduceMotion.System)}
            style={{ gap: 20 }}
          >
            {children}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
      {footer ? (
        <View
          style={{
            padding: 16,
            gap: 10,
            borderTopWidth: 1,
            borderTopColor: c.border,
          }}
        >
          {footer}
        </View>
      ) : null}
    </SafeAreaView>
  );
}
export function Row({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      {children}
    </View>
  );
}
