const FALLBACK = "unknown";

const TRUSTED_HEADERS = ["cf-connecting-ip", "x-vercel-forwarded-for", "x-real-ip"];

const trustProxyDepth = () => {
  const configured = Number(process.env.TRUSTED_PROXY_HOPS ?? "1");

  return Number.isFinite(configured) && configured > 0 ? configured : 1;
};

const requestIp = (request) => {
  for (const header of TRUSTED_HEADERS) {
    const value = request.headers.get(header)?.trim();

    if (value) return value;
  }

  const forwarded = request.headers.get("x-forwarded-for");

  if (!forwarded) return FALLBACK;

  const hops = forwarded
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (hops.length === 0) return FALLBACK;

  return hops[Math.max(0, hops.length - trustProxyDepth())] ?? FALLBACK;
};

export default requestIp;
