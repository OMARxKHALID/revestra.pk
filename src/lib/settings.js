import { DEFAULT_COMMERCE } from "@/lib/shipping";
import { PAYMENT_METHODS } from "@/lib/schemas/order";
import { DEFAULT_PAYMENT_NOTES } from "@/lib/payments/notes";

export const DEFAULT_SETTINGS = {
  name: "General Store",
  legalName: "General Store",
  tagline: "Secondhand, washed and measured",
  description:
    "Secondhand jeans, jackets, shirts, shoes and belts — washed, measured and one of a kind, shipped across Pakistan.",
  email: "hello@generalstore.pk",
  phone: "",
  addressLine: "",
  city: "Karachi, Pakistan",
  hours: "Office Hours: 9AM—6PM(ish)",
  socials: [
    { name: "instagram", label: "Instagram", href: "https://www.instagram.com/" },
    { name: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/" },
  ],
  ticker: [
    { icon: "globe", text: "Everyday goods, plainly made — shipped across Pakistan" },
    { icon: "clock", text: "" },
    { icon: "shield", text: "" },
  ],
  commerce: DEFAULT_COMMERCE,
  enabledMethods: PAYMENT_METHODS,
  paymentNotes: DEFAULT_PAYMENT_NOTES,
  signupOpen: true,
  policies: [
    {
      slug: "shipping",
      title: "Shipping",
      body: "Orders leave within two working days. Standard delivery reaches most cities in three to five working days, express in one to two. You get a tracking number by email the moment a parcel is handed to the courier.",
    },
    {
      slug: "returns",
      title: "Returns",
      body: "Every piece is secondhand and one of one, measured and photographed before listing. If an item arrives not as described, tell us within seven days of delivery and we will arrange a return and a full refund. Refunds go back to the account that paid.",
    },
    {
      slug: "privacy",
      title: "Privacy",
      body: "We store your name, email, phone and delivery address so we can fulfil your order, and your order history so you can track it. Payment details are handled by the payment gateway and never reach our servers. We do not sell your data. Write to us to have your account deleted.",
    },
    {
      slug: "terms",
      title: "Terms",
      body: "Prices are in Pakistani rupees and include any applicable tax. Stock is held for a limited window while you pay; if payment does not complete, the piece goes back on sale. Since every item is unique, an order is confirmed only once payment clears or, for cash on delivery, once we confirm it.",
    },
  ],
};
