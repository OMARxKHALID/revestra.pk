import { newsletterSchema } from "@/lib/schemas/newsletter";
import { isDatabaseConfigured } from "@/lib/db";
import { subscribe } from "@/lib/api/subscribers";
import { createLimiter, tooManyRequests } from "@/lib/rate-limit";
import RATE_LIMITS from "@/lib/rate-limits";
import requestIp from "@/lib/utils/request-ip";
import { sameOrigin, badOrigin } from "@/lib/api/origin";

const limiter = createLimiter(RATE_LIMITS.newsletter);

export const POST = async (request) => {
  if (!sameOrigin(request)) return badOrigin();

  const gate = await limiter.check(requestIp(request));

  if (!gate.ok) return tooManyRequests(gate.resetAt);

  let payload;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Malformed request" }, { status: 400 });
  }

  const parsed = newsletterSchema.safeParse(payload);

  if (!parsed.success)
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid submission" },
      { status: 422 }
    );

  const email = parsed.data.email.toLowerCase();

  if (!isDatabaseConfigured()) {
    console.info(`[newsletter] no database configured, dropping ${email}`);
    return Response.json({ ok: true, persisted: false });
  }

  try {
    await subscribe(email);
  } catch (error) {
    console.error(`[newsletter] could not store ${email}: ${error.message}`);

    return Response.json(
      { error: "We could not save your address. Try again shortly." },
      { status: 503 }
    );
  }

  return Response.json({ ok: true, persisted: true });
};
