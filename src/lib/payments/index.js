import jazzcash from "@/lib/payments/jazzcash";
import easypaisa from "@/lib/payments/easypaisa";
import cod from "@/lib/payments/cod";
import { cardProvider } from "@/lib/payments/config";
import { isDatabaseConfigured } from "@/lib/db";

const ADAPTERS = { jazzcash, easypaisa, cod };

export const getAdapter = (method) => {
  if (method === "card") return ADAPTERS[cardProvider()] ?? null;

  return ADAPTERS[method] ?? null;
};

export const modeFor = (method) => (method === "card" ? "card" : "wallet");

export const listMethods = () => {
  const methods = [
    {
      id: "jazzcash",
      label: "JazzCash",
      note: "Mobile wallet",
      available: jazzcash.isConfigured(),
    },
    {
      id: "easypaisa",
      label: "Easypaisa",
      note: "Mobile wallet",
      available: easypaisa.isConfigured(),
    },
    {
      id: "card",
      label: "Debit or credit card",
      note: "Visa, Mastercard",
      available: getAdapter("card")?.isConfigured() ?? false,
    },
    {
      id: "cod",
      label: "Cash on delivery",
      note: "Pay the courier",
      available: true,
    },
  ];

  if (!isDatabaseConfigured())
    return methods.map((method) => ({
      ...method,
      available: method.id === "cod",
      note: method.id === "cod" ? method.note : "Needs a database",
    }));

  return methods;
};
