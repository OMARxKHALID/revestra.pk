const DEV_FALLBACK = "development-only-auth-secret-not-for-production";

let warned = false;

export const authSecret = () => {
  const configured = process.env.AUTH_SECRET?.trim();

  if (configured) return configured;

  if (process.env.NODE_ENV === "production") return undefined;

  if (!warned) {
    warned = true;
    console.warn(
      "[auth] AUTH_SECRET is not set — using a development-only fallback. Run `bunx auth secret` and add it to .env.local before deploying."
    );
  }

  return DEV_FALLBACK;
};
