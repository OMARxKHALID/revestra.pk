const env = (name) => process.env[name]?.trim() || "";

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
  action: isLive()
    ? "https://easypay.easypaisa.com.pk/easypay/Index.jsf"
    : "https://easypaystg.easypaisa.com.pk/easypay/Index.jsf",
  confirmAction: isLive()
    ? "https://easypay.easypaisa.com.pk/easypay/Confirm.jsf"
    : "https://easypaystg.easypaisa.com.pk/easypay/Confirm.jsf",
});

export const cardProvider = () => env("PAYMENT_CARD_PROVIDER") || "jazzcash";

export const siteUrl = () =>
  env("NEXT_PUBLIC_SITE_URL") || "http://localhost:3000";
