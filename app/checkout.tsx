import { useRef, useState } from "react";
import { router } from "expo-router";
import * as Crypto from "expo-crypto";
import { Keyboard, type ScrollViewInstance } from "react-native";
import { Page, Title, T, Field, Button, ErrorText } from "../components/ui";
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
        <Title>Your bag is empty.</Title>
        <Button
          label="Continue shopping"
          onPress={() => router.replace("/shop")}
        />
      </Page>
    );
  return (
    <Page scrollRef={scrollRef}>
      <Title>
        {step === "shipping"
          ? "Shipping address"
          : step === "payment"
            ? "Payment"
            : "Review order"}
      </Title>
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
          <T>United States</T>
          <T>Delivery</T>
          <Button
            secondary={delivery !== "standard"}
            label="Standard · 4 to 6 days · $8 or free at $150"
            id="delivery-standard"
            onPress={() => setDelivery("standard")}
          />
          <Button
            secondary={delivery !== "express"}
            label="Express · 1 to 2 days · $18"
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
          <Button
            secondary={payment !== "delivery"}
            label="Pay on delivery"
            id="payment-delivery"
            onPress={() => setPayment("delivery")}
          />
          <Button
            secondary={payment !== "card"}
            label="Card"
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
          <Button
            secondary
            label="Edit shipping"
            onPress={() => setStep("shipping")}
          />
        </>
      ) : (
        <>
          <T>
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
          <T>
            {delivery === "express"
              ? "Express delivery, 1 to 2 days"
              : "Standard delivery, 4 to 6 days"}
            {"\n"}
            {payment === "card" ? "Card" : "Pay on delivery"}
          </T>
          {cart.map((l, i) => (
            <T key={i}>
              {l.quantity} × {productById(l.productId)?.name} · Size {l.size} ·{" "}
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
          <Button
            secondary
            label="Edit payment"
            onPress={() => setStep("payment")}
          />
          <Button
            secondary
            label="Edit shipping"
            onPress={() => setStep("shipping")}
          />
        </>
      )}
    </Page>
  );
}
