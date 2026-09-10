import errorMessage from "@/lib/utils/error-message";

const DEFAULT_MAX_KEYS = 5000;

export const createRateLimiter = ({
  limit,
  windowMs,
  max = DEFAULT_MAX_KEYS,
  now = () => Date.now(),
}) => {
  const hits = new Map();

  const check = (key) => {
    const at = now();
    const entry = hits.get(key);

    if (!entry || entry.resetAt <= at) {
      hits.delete(key);

      if (hits.size >= max) hits.delete(hits.keys().next().value);

      hits.set(key, { count: 1, resetAt: at + windowMs });

      return { ok: true, remaining: limit - 1, resetAt: at + windowMs };
    }

    hits.delete(key);
    hits.set(key, entry);

    if (entry.count >= limit)
      return { ok: false, remaining: 0, resetAt: entry.resetAt };

    entry.count += 1;

    return {
      ok: true,
      remaining: limit - entry.count,
      resetAt: entry.resetAt,
    };
  };

  const reset = () => hits.clear();

  return { check, reset };
};

export const createLimiter = ({ limit, windowMs }) => {
  const local = createRateLimiter({ limit, windowMs });

  const check = async (key) => {
    try {
      const { consume } = await import("@/lib/api/rate-limit-store");
      const shared = await consume({ key, limit, windowMs });

      if (shared) return shared;
    } catch (error) {
      console.warn(
        `[rate-limit] shared store unavailable: ${errorMessage(error)}`
      );
    }

    return local.check(key);
  };

  return { check, reset: local.reset };
};

export const tooManyRequests = (resetAt, now = Date.now()) =>
  Response.json(
    { error: "Too many requests. Try again shortly." },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.max(1, Math.ceil((resetAt - now) / 1000))),
      },
    }
  );
