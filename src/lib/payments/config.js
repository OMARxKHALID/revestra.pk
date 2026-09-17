const env = (name) => process.env[name]?.trim() || "";

const PAKISTAN_TIME = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Karachi",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

export const pakistanTime = (date) =>
  Object.fromEntries(
    PAKISTAN_TIME.formatToParts(date).map(({ type, value }) => [type, value])
  );

export const isLive = () => env("PAYMENT_ENV") === "live";

export const jazzcashConfig = () => ({
  merchantId: env("JAZZCASH_MERCHANT_ID"),
  password: env("JAZZCASH_PASSWORD"),
  integritySalt: env("JAZZCASH_INTEGRITY_SALT"),
  action: isLive()
    ? "https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform"
    : "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform",
});

export const easypaisaConfig = () => ({
  storeId: env("EASYPAISA_STORE_ID"),
  hashKey: env("EASYPAISA_HASH_KEY"),
  accountNum: env("EASYPAISA_ACCOUNT_NUM"),
  username: env("EASYPAISA_USERNAME"),
  password: env("EASYPAISA_PASSWORD"),
  action: isLive()
    ? "https://easypay.easypaisa.com.pk/easypay/Index.jsf"
    : "https://easypaystg.easypaisa.com.pk/easypay/Index.jsf",
  confirmAction: isLive()
    ? "https://easypay.easypaisa.com.pk/easypay/Confirm.jsf"
    : "https://easypaystg.easypaisa.com.pk/easypay/Confirm.jsf",
  inquiryAction: isLive()
    ? "https://easypay.easypaisa.com.pk/easypay-service/rest/v4/inquire-transaction"
    : "https://easypaystg.easypaisa.com.pk/easypay-service/rest/v4/inquire-transaction",
});

export const cardProvider = () => env("PAYMENT_CARD_PROVIDER") || "jazzcash";

export const siteUrl = () =>
  env("NEXT_PUBLIC_SITE_URL") || "http://localhost:3000";
