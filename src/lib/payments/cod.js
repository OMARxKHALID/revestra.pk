const cod = {
  id: "cod",
  label: "Cash on Delivery",
  modes: [],
  isConfigured: () => true,
  createSession: () => ({ kind: "none" }),
  parseCallback: async () => ({}),
  verifyCallback: () => ({
    ok: true,
    attemptRef: null,
    status: "not_required",
    code: "cod",
    message: "Payable on delivery",
    verification: "none",
    raw: {},
  }),
};

export default cod;
