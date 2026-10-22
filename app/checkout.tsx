import { useRef, useState } from "react";
import { router } from "expo-router";
import * as Crypto from "expo-crypto";
import { Keyboard, type ScrollViewInstance } from "react-native";
import {
  Page,
  Title,
  T,
  Field,
  Button,
  ErrorText,
  Heading,
  Option,
} from "../components/ui";
import { View } from "react-native";
import { Summary } from "../components/summary";
import { useStore } from "../lib/provider";
import { addressSchema, type Address } from "../lib/schema";
import { placeOrder } from "../lib/store";
import { money, productById } from "../lib/catalog";
const empty: Address = {
  name: "",
  address: "",
  city: "",
  region: "",
  postal: "",
  phone: "",
  country: "United States",
};
export default function Checkout() {
  const { state, update } = useStore();
  const scrollRef = useRef<ScrollViewInstance | null>(null);
  const cart = state.carts[state.session?.id ?? ""] ?? [];
  const [step, setStep] = useState<"shipping" | "payment" | "review">(
    "shipping",
  );
  const [address, setAddress] = useState(empty);
  const [delivery, setDelivery] = useState<"standard" | "express">("standard");
  const [payment, setPayment] = useState<"delivery" | "card">("delivery");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const requestId = useRef(Crypto.randomUUID());
  function validate() {
    const result = addressSchema.safeParse(address);
    const errs: Record<string, string> = {};
    if (!result.success) {
      for (const issue of result.error.issues)
        errs[String(issue.path[0])] = issue.message;
      setErrors(errs);
      Keyboard.dismiss();
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      return false;
    }
    setAddress(result.data);
    setErrors({});
    return true;
  }
  async function place() {
    if (lock.current) return;
    if (!validate()) {
      setStep("shipping");
      return;
    }
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      let orderId = "";
      await update((s) => {
        const result = placeOrder(s, {
          items: cart,
          address,
          delivery,
          payment,
          requestId: requestId.current,
        });
        orderId = result.order.id;
        return result.state;
      });
      router.replace({ pathname: "/confirmation", params: { id: orderId } });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Unable to save your order. Please try again.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  if (!cart.length)
    return (
      <Page>
        <Title>Your bag is empty</Title>
        <Button
          label="Continue shopping"
          onPress={() => router.replace("/shop")}
        />
      </Page>
    );
  return (
    <Page scrollRef={scrollRef}>
      <View>
        <Title>
          {step === "shipping"
            ? "Shipping"
            : step === "payment"
              ? "Payment"
              : "Review"}
        </Title>
      </View>
      {step === "shipping" ? (
        <>
          {(
            [
              "name",
              "address",
              "city",
              "region",
              "postal",
              "phone",
            ] satisfies (keyof Address)[]
          ).map((key) => (
            <Field
              key={key}
              id={`shipping-${key}`}
              label={
                {
                  name: "Full name",
                  address: "Street address",
                  city: "City",
                  region: "State",
                  postal: "ZIP code",
                  phone: "Phone",
                  country: "Country",
                }[key]
              }
              value={address[key]}
              onChangeText={(value) => {
                setAddress((a) => ({ ...a, [key]: value }));
                setErrors((previous) => ({ ...previous, [key]: "" }));
              }}
              error={errors[key]}
              keyboardType={
                key === "phone"
                  ? "phone-pad"
                  : key === "postal"
                    ? "number-pad"
                    : "default"
              }
            />
          ))}
          <T size={14} muted>
            We ship within the United States.
          </T>
          <Heading>Delivery</Heading>
          <Option
            selected={delivery === "standard"}
            label="Standard"
            detail="4 to 6 days · $8, free over $150"
            id="delivery-standard"
            onPress={() => setDelivery("standard")}
          />
          <Option
            selected={delivery === "express"}
            label="Express"
            detail="1 to 2 days · $18"
            id="delivery-express"
            onPress={() => setDelivery("express")}
          />
          <Button
            label="Continue to payment"
            id="checkout-shipping-next"
            onPress={() => {
              if (validate()) {
                Keyboard.dismiss();
                scrollRef.current?.scrollTo({ y: 0, animated: false });
                setStep("payment");
              }
            }}
          />
        </>
      ) : step === "payment" ? (
        <>
          <Option
            selected={payment === "delivery"}
            label="Pay on delivery"
            detail="Pay when it arrives"
            id="payment-delivery"
            onPress={() => setPayment("delivery")}
          />
          <Option
            selected={payment === "card"}
            label="Card"
            detail="Visa, Mastercard and Amex"
            id="payment-card"
            onPress={() => setPayment("card")}
          />

          <Button
            label="Review order"
            id="checkout-payment-next"
            onPress={() => {
              scrollRef.current?.scrollTo({ y: 0, animated: false });
              setStep("review");
            }}
          />
          <Button secondary label="Back" onPress={() => setStep("shipping")} />
        </>
      ) : (
        <>
          <Heading>Ship to</Heading>
          <T size={14}>
            {address.name}
            {"\n"}
            {address.address}
            {"\n"}
            {address.city}, {address.region} {address.postal}
            {"\n"}
            {address.country}
            {"\n"}
            {address.phone}
          </T>
          <Heading>Delivery and payment</Heading>
          <T size={14}>
            {delivery === "express"
              ? "Express, 1 to 2 days"
              : "Standard, 4 to 6 days"}
            {"\n"}
            {payment === "card" ? "Card" : "Pay on delivery"}
          </T>
          <Heading>Items</Heading>
          {cart.map((l, i) => (
            <T key={i} size={14}>
              {l.quantity} × {productById(l.productId)?.name}, size {l.size}
              {"   "}
              {money((productById(l.productId)?.price ?? 0) * l.quantity)}
            </T>
          ))}
          <Summary items={cart} delivery={delivery} />
          <ErrorText text={error} />
          <Button
            label="Place order"
            id="place-order"
            onPress={place}
            busy={busy}
          />
          <Button secondary label="Back" onPress={() => setStep("payment")} />
        </>
      )}
    </Page>
  );
}
