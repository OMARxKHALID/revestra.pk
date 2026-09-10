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
};
