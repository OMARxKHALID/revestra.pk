import "server-only";

const COOKIE = /ph_phc_.*?_posthog=([^;]+)/;

export const viewerIdFromCookie = (cookieHeader) => {
  if (!cookieHeader) return null;

  const match = cookieHeader.match(COOKIE);

  if (!match) return null;

  try {
    return JSON.parse(decodeURIComponent(match[1])).distinct_id ?? null;
  } catch {
    return null;
  }
};
