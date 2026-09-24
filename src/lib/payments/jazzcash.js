import { PAYMENT_METHOD, PAYMENT_STATUS } from "@/lib/schemas/order";
import { CURRENCY } from "@/lib/utils/price";
import { jazzcashConfig, pakistanTime, siteUrl } from "@/lib/payments/config";
import { buildSecureHash, verifySecureHash } from "@/lib/payments/jazzcash-hash";

const PAID_CODES = ["000", "121"];
const PENDING_CODES = ["124", "157", "210", "200"];

const TXN_TYPES = { wallet: "MWALLET", card: "MIGS", bank: "DD", otc: "OTC" };

export const stamp = (date) => {
  const { year, month, day, hour, minute, second } = pakistanTime(date);

  return `${year}${month}${day}${hour}${minute}${second}`;
};

export const attemptRefFor = (reference, attempt) =>
  `${reference.replace(/[^A-Za-z0-9./]/g, "")}${attempt}`.slice(0, 20);

export const sanitizeDescription = (text) =>
  text.replace(/[<>\\"*=%/:'{}|]/g, " ").slice(0, 200);

export const buildFields = ({
  order,
  mode,
  attempt = 1,
  now = new Date(),
  config = jazzcashConfig(),
  returnUrl,
}) => {
  const expiry = new Date(now.getTime() + 60 * 60 * 1000);

  const fields = {
    pp_Version: "1.1",
    pp_TxnType: TXN_TYPES[mode] ?? "",
    pp_Language: "EN",
    pp_MerchantID: config.merchantId,
    pp_SubMerchantID: "",
    pp_Password: config.password,
    pp_BankID: "",
    pp_ProductID: "",
    pp_TxnRefNo: attemptRefFor(order.reference, attempt),
    pp_Amount: String(order.payment.amountCents),
    pp_TxnCurrency: CURRENCY,
    pp_TxnDateTime: stamp(now),
    pp_BillReference: order.reference.replace(/-/g, "").slice(0, 20),
    pp_Description: sanitizeDescription(
      `Order ${order.reference} — ${order.items.length} item(s)`
    ),
    pp_TxnExpiryDateTime: stamp(expiry),
    pp_ReturnURL: returnUrl,
    ppmpf_1: order.reference,
  };

  return {
    ...fields,
    pp_SecureHash: buildSecureHash(fields, config.integritySalt),
  };
};

const jazzcash = {
  id: PAYMENT_METHOD.jazzcash,
  label: "JazzCash",
  modes: ["wallet", "card", "bank", "otc"],

  isConfigured: () => {
    const { merchantId, password, integritySalt } = jazzcashConfig();
    return Boolean(merchantId && password && integritySalt);
  },

  createSession: ({ order, mode = "wallet", attempt = 1, now = new Date() }) => {
    const config = jazzcashConfig();
    const returnUrl = `${siteUrl()}/api/payments/jazzcash/callback`;
    const fields = buildFields({ order, mode, attempt, now, config, returnUrl });

    return {
      kind: "redirect_form",
      action: config.action,
      fields,
      attemptRef: fields.pp_TxnRefNo,
    };
  },

  parseCallback: async (request) => {
    if (request.method === "GET")
      return Object.fromEntries(new URL(request.url).searchParams);

    return Object.fromEntries(await request.formData());
  },

  verifyCallback: async ({ fields, config = jazzcashConfig() }) => {
    const code = String(fields.pp_ResponseCode ?? "");
    const signed = verifySecureHash(fields, config.integritySalt);

    const status = PAID_CODES.includes(code)
      ? PAYMENT_STATUS.paid
      : PENDING_CODES.includes(code)
        ? PAYMENT_STATUS.pending
        : PAYMENT_STATUS.failed;

    return {
      ok: signed,
      attemptRef: String(fields.pp_TxnRefNo ?? ""),
      reference: String(fields.ppmpf_1 ?? ""),
      status: signed ? status : PAYMENT_STATUS.failed,
      code,
      message: String(fields.pp_ResponseMessage ?? ""),
      amountCents: Number(fields.pp_Amount ?? 0),
      providerTxnId: String(fields.pp_RetreivalReferenceNo ?? "") || null,
      verification: signed ? "signed" : "none",
      raw: fields,
    };
  },
};

export default jazzcash;
