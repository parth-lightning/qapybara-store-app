import { z } from "zod";
export const accountInput = z.object({
  email: z
    .email()
    .max(200)
    .transform((v) => v.toLowerCase().trim()),
  password: z.string().min(8, "Use at least 8 characters.").max(128),
  name: z.string().trim().min(2, "Enter your name.").max(80),
});
export const loginInput = accountInput.pick({ email: true, password: true });
export const userSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string(),
});
export type User = z.infer<typeof userSchema>;
export const cartLineSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1).max(99),
  variant: z.enum(["Warm white", "Soft white"]),
});
export type CartLine = z.infer<typeof cartLineSchema>;
export const addressSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(80),
  address: z.string().trim().min(5, "Enter a street address.").max(160),
  city: z.string().trim().min(2, "Enter your city.").max(80),
  region: z.string().trim().min(2, "Enter your state.").max(80),
  postal: z.string().regex(/^\d{5}(-\d{4})?$/, "Enter a valid US ZIP code."),
  phone: z
    .string()
    .regex(/^\+?[\d ()-]{7,20}$/, "Enter a valid phone number.")
    .refine((value) => {
      const digits = value.replace(/\D/g, "");
      return (
        digits.length === 10 || (digits.length === 11 && digits.startsWith("1"))
      );
    }, "Enter a 10-digit US phone number, optionally with country code +1."),
  country: z.literal("United States"),
});
export type Address = z.infer<typeof addressSchema>;
export const checkoutSchema = z.object({
  items: z.array(cartLineSchema).min(1).max(32),
  address: addressSchema,
  delivery: z.enum(["standard", "express"]),
  payment: z.enum(["delivery", "card"]),
  requestId: z.uuid(),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export const totalsSchema = z.object({
  subtotal: z.number().int(),
  shipping: z.number().int(),
  tax: z.number().int(),
  total: z.number().int(),
});
export const orderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  createdAt: z.string(),
  items: z.array(
    cartLineSchema.extend({
      name: z.string(),
      price: z.number().int(),
      image: z.string(),
    }),
  ),
  address: addressSchema,
  delivery: z.enum(["standard", "express"]),
  payment: z.enum(["delivery", "card"]),
  totals: totalsSchema,
});
export type Order = z.infer<typeof orderSchema>;
export const storeSchema = z.object({
  cart: z.array(cartLineSchema),
  orders: z.array(orderSchema),
});
export type StoreData = z.infer<typeof storeSchema>;
