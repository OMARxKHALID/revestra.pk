const FALLBACK = "unknown";

const requestIp = (request) => {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return request.headers.get("x-real-ip")?.trim() || FALLBACK;
};

export default requestIp;
