import { z } from "zod";

export const shippingSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  email: z.email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^(?:\+92|0)3\d{2}[\s-]?\d{7}$/, "Enter a Pakistani mobile number"),
  address: z.string().trim().min(4, "Enter your street address"),
  apartment: z.string().trim().max(80).optional().or(z.literal("")),
  city: z.string().trim().min(2, "Enter your city"),
  postalCode: z.string().trim().min(3, "Enter your postal code"),
  country: z.string().trim().min(2, "Enter your country"),
});

const orderLineSchema = z
  .object({ slug: z.string().min(1) })
  .transform(({ slug }) => ({ slug }));

export const PAYMENT_METHOD = {
  jazzcash: "jazzcash",
  easypaisa: "easypaisa",
  card: "card",
  cod: "cod",
};

export const PAYMENT_METHODS = Object.values(PAYMENT_METHOD);

export const PAYMENT_STATUS = {
  pending: "pending",
  paid: "paid",
  failed: "failed",
  notRequired: "not_required",
};

export const ORDER_STATUS = {
  pendingPayment: "pending_payment",
  received: "received",
  processing: "processing",
  shipped: "shipped",
  delivered: "delivered",
  cancelled: "cancelled",
  failed: "failed",
};

export const ORDER_STATUSES = Object.values(ORDER_STATUS);

export const FULFILLED_ORDER_STATUSES = [
  ORDER_STATUS.received,
  ORDER_STATUS.processing,
  ORDER_STATUS.shipped,
  ORDER_STATUS.delivered,
];

export const SETTABLE_ORDER_STATUSES = [
  ...FULFILLED_ORDER_STATUSES,
  ORDER_STATUS.cancelled,
];

export const SHIPPING_RATE_IDS = ["standard", "express"];

export const orderSchema = z.object({
  shipping: shippingSchema,
  distinctId: z.string().trim().max(200).optional().or(z.literal("")),
  items: z.array(orderLineSchema).min(1, "Your cart is empty").max(50),
  promoCode: z.string().trim().max(24).optional().or(z.literal("")),
  rateId: z.enum(SHIPPING_RATE_IDS).default("standard"),
  method: z.enum(PAYMENT_METHODS).default(PAYMENT_METHOD.cod),
});

export const orderLookupSchema = z.object({
  reference: z.string().trim().min(4, "Enter your order reference"),
  email: z.string().trim().pipe(z.email("Enter the email you ordered with")),
});

export const orderCancelSchema = z.object({
  reference: z.string().trim().min(4, "Enter your order reference"),
  token: z.string().trim().max(400).default(""),
});
