import { newsletterSchema } from "@/lib/schemas/newsletter";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { createRateLimiter, tooManyRequests } from "@/lib/rate-limit";
import requestIp from "@/lib/utils/request-ip";

const limiter = createRateLimiter({ limit: 5, windowMs: 60 * 60 * 1000 });

export const POST = async (request) => {
  const gate = limiter.check(requestIp(request));

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
    const db = await getDb();

    await db
      .collection("subscribers")
      .updateOne(
        { email },
        { $setOnInsert: { email, createdAt: new Date() } },
        { upsert: true }
      );
  } catch (error) {
    console.error(`[newsletter] could not store ${email}: ${error.message}`);

    return Response.json(
      { error: "We could not save your address. Try again shortly." },
      { status: 503 }
    );
  }

  return Response.json({ ok: true, persisted: true });
};
