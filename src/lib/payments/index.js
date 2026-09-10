import jazzcash from "@/lib/payments/jazzcash";
import easypaisa from "@/lib/payments/easypaisa";
import cod from "@/lib/payments/cod";
import { cardProvider } from "@/lib/payments/config";
import { PAYMENT_METHOD, PAYMENT_METHODS } from "@/lib/schemas/order";
import { DEFAULT_PAYMENT_NOTES } from "@/lib/payments/notes";
import { isDatabaseConfigured } from "@/lib/db";

const ADAPTERS = { jazzcash, easypaisa, cod };

export const getAdapter = (method) => {
  if (method === PAYMENT_METHOD.card) return ADAPTERS[cardProvider()] ?? null;

  return ADAPTERS[method] ?? null;
};

export const modeFor = (method) =>
  method === PAYMENT_METHOD.card ? "card" : "wallet";

export const listMethods = ({
  enabledMethods = PAYMENT_METHODS,
  paymentNotes = {},
} = {}) => {
  const methods = [
    {
      id: PAYMENT_METHOD.jazzcash,
      label: "JazzCash",
      note:
        paymentNotes[PAYMENT_METHOD.jazzcash] ??
        DEFAULT_PAYMENT_NOTES.jazzcash,
      available: jazzcash.isConfigured(),
    },
    {
      id: PAYMENT_METHOD.easypaisa,
      label: "Easypaisa",
      note:
        paymentNotes[PAYMENT_METHOD.easypaisa] ??
        DEFAULT_PAYMENT_NOTES.easypaisa,
      available: easypaisa.isConfigured(),
    },
    {
      id: PAYMENT_METHOD.card,
      label: "Debit or credit card",
      note: paymentNotes[PAYMENT_METHOD.card] ?? DEFAULT_PAYMENT_NOTES.card,
      available: getAdapter(PAYMENT_METHOD.card)?.isConfigured() ?? false,
    },
    {
      id: PAYMENT_METHOD.cod,
      label: "Cash on delivery",
      note: paymentNotes[PAYMENT_METHOD.cod] ?? DEFAULT_PAYMENT_NOTES.cod,
      available: true,
    },
  ];

  const switched = methods.map((method) => ({
    ...method,
    available: method.available && enabledMethods.includes(method.id),
  }));

  if (!isDatabaseConfigured())
    return switched.map((method) => ({
      ...method,
      available:
        method.id === PAYMENT_METHOD.cod &&
        enabledMethods.includes(PAYMENT_METHOD.cod),
      note:
        method.id === PAYMENT_METHOD.cod ? method.note : "Needs a database",
    }));

  return switched;
};
