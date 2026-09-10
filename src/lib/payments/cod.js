import { PAYMENT_METHOD, PAYMENT_STATUS } from "@/lib/schemas/order";

const cod = {
  id: PAYMENT_METHOD.cod,
  label: "Cash on Delivery",
  modes: [],
  isConfigured: () => true,
  createSession: () => ({ kind: "none" }),
  parseCallback: async () => ({}),
  verifyCallback: async () => ({
    ok: true,
    attemptRef: null,
    status: PAYMENT_STATUS.notRequired,
    code: "cod",
    message: "Payable on delivery",
    verification: "none",
    raw: {},
  }),
};

export default cod;
