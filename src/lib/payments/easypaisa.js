import { PAYMENT_METHOD, PAYMENT_STATUS } from "@/lib/schemas/order";
import { easypaisaConfig, siteUrl } from "@/lib/payments/config";
import {
  buildMerchantHash,
  toEasypaisaAmount,
} from "@/lib/payments/easypaisa-hash";
import errorMessage from "@/lib/utils/error-message";

const METHODS = {
  wallet: "MA_PAYMENT_METHOD",
  card: "CC_PAYMENT_METHOD",
  otc: "OTC_PAYMENT_METHOD",
};

const PAID_STATUSES = ["PAID", "0000"];

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

export const canInquire = (config) =>
  Boolean(config.accountNum && config.username && config.password);

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

export const inquireTransaction = async ({
  attemptRef,
  config,
  fetchImpl = fetch,
}) => {
  const credentials = Buffer.from(
    `${config.username}:${config.password}`,
    "utf8"
  ).toString("base64");

  const response = await fetchImpl(config.inquiryAction, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      credentials,
    },
    body: JSON.stringify({
      orderId: attemptRef,
      storeId: config.storeId,
      accountNum: config.accountNum,
    }),
  });

  if (!response.ok)
    throw new Error(`the inquiry endpoint answered ${response.status}`);

  return response.json();
};

const unverified = (attemptRef, verification, message) => ({
  ok: false,
  attemptRef,
  reference: null,
  status: PAYMENT_STATUS.failed,
  code: "",
  message,
  amountCents: 0,
  providerTxnId: null,
  verification,
  raw: {},
});

const easypaisa = {
  id: PAYMENT_METHOD.easypaisa,
  label: "Easypaisa",
  modes: ["wallet", "card", "otc"],

  isConfigured: () => {
    const config = easypaisaConfig();
    return Boolean(config.storeId && config.hashKey) && canInquire(config);
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

  verifyCallback: async ({
    fields,
    config = easypaisaConfig(),
    fetchImpl = fetch,
  }) => {
    const attemptRef = String(
      fields.orderRefNumber ?? fields.orderRefNum ?? ""
    );

    if (!attemptRef)
      return unverified(attemptRef, "no_reference", "No order reference");

    if (!canInquire(config))
      return unverified(
        attemptRef,
        "inquiry_unconfigured",
        "Easypaisa settlement cannot be verified on this deployment"
      );

    let inquiry;

    try {
      inquiry = await inquireTransaction({ attemptRef, config, fetchImpl });
    } catch (error) {
      return unverified(attemptRef, "inquiry_failed", errorMessage(error));
    }

    const code = String(inquiry.responseCode ?? "");
    const state = String(inquiry.transactionStatus ?? "").toUpperCase();
    const paid = code === "0000" && PAID_STATUSES.includes(state);

    return {
      ok: true,
      attemptRef,
      reference: null,
      status: paid ? PAYMENT_STATUS.paid : PAYMENT_STATUS.failed,
      code,
      message: String(inquiry.responseDesc ?? inquiry.desc ?? ""),
      amountCents: Math.round(Number(inquiry.transactionAmount ?? 0) * 100),
      providerTxnId: String(inquiry.paymentToken ?? "") || null,
      verification: "server_inquiry",
      raw: { postback: fields, inquiry },
    };
  },
};

export default easypaisa;
