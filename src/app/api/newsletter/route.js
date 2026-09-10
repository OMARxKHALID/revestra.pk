import { newsletterSchema } from "@/lib/schemas/newsletter";
import { isDatabaseConfigured } from "@/lib/db";
import { subscribe } from "@/lib/api/subscribers";
import { createLimiter } from "@/lib/rate-limit";
import RATE_LIMITS from "@/lib/rate-limits";
import { guardRequest } from "@/lib/api/request";

const limiter = createLimiter(RATE_LIMITS.newsletter);

export const POST = async (request) => {
  const gated = await guardRequest(request, {
    limiter,
    schema: newsletterSchema,
    fallback: "Invalid submission",
  });

  if (gated.response) return gated.response;

  const email = gated.data.email.toLowerCase();

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
