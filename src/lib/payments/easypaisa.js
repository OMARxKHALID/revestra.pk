import { easypaisaConfig, siteUrl } from "@/lib/payments/config";
import {
  buildMerchantHash,
  toEasypaisaAmount,
} from "@/lib/payments/easypaisa-hash";

const METHODS = {
  wallet: "MA_PAYMENT_METHOD",
  card: "CC_PAYMENT_METHOD",
  otc: "OTC_PAYMENT_METHOD",
};

export const expiryStamp = (date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
    " ",
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
    String(date.getSeconds()).padStart(2, "0"),
  ].join("");

export const attemptRefFor = (reference, attempt) =>
  `${reference.replace(/-/g, "")}${attempt}`.slice(0, 20);

export const buildFields = ({
  order,
  mode,
  attempt = 1,
  now = new Date(),
  config = easypaisaConfig(),
  postBackURL,
}) => {
  const params = {
    amount: toEasypaisaAmount(order.payment.amountCents),
    autoRedirect: "1",
    expiryDate: expiryStamp(new Date(now.getTime() + 60 * 60 * 1000)),
    orderRefNum: attemptRefFor(order.reference, attempt),
    paymentMethod: METHODS[mode] ?? "",
    postBackURL,
    storeId: config.storeId,
  };

  return {
    ...params,
    merchantHashedReq: buildMerchantHash(params, config.hashKey),
  };
};

const easypaisa = {
  id: "easypaisa",
  label: "Easypaisa",
  modes: ["wallet", "card", "otc"],

  isConfigured: () => {
    const { storeId, hashKey } = easypaisaConfig();
    return Boolean(storeId && hashKey);
  },

  createSession: ({ order, mode = "wallet", attempt = 1, now = new Date() }) => {
    const config = easypaisaConfig();
    const postBackURL = `${siteUrl()}/api/payments/easypaisa/callback`;
    const fields = buildFields({
      order,
      mode,
      attempt,
      now,
      config,
      postBackURL,
    });

    return {
      kind: "redirect_form",
      action: config.action,
      fields,
      attemptRef: fields.orderRefNum,
    };
  },

  parseCallback: async (request) => {
    if (request.method === "GET")
      return Object.fromEntries(new URL(request.url).searchParams);

    return Object.fromEntries(await request.formData());
  },

  verifyCallback: ({ fields }) => {
    const code = String(fields.status ?? fields.responseCode ?? "");
    const paid = ["0000", "0", "SUCCESS", "success"].includes(code);

    return {
      ok: true,
      attemptRef: String(fields.orderRefNumber ?? fields.orderRefNum ?? ""),
      reference: null,
      status: paid ? "paid" : "failed",
      code,
      message: String(fields.desc ?? fields.description ?? ""),
      amountCents: Math.round(Number(fields.transactionAmount ?? 0) * 100),
      providerTxnId: String(fields.paymentToken ?? "") || null,
      verification: "unverified_postback",
      raw: fields,
    };
  },
};

export default easypaisa;
