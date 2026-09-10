import { setPasswordByEmail } from "@/lib/api/users";
import { verifyCode } from "@/lib/api/password-reset";
import { resetConfirmSchema } from "@/lib/schemas/account";
import { createLimiter, tooManyRequests } from "@/lib/rate-limit";
import RATE_LIMITS from "@/lib/rate-limits";
import { sameOrigin, badOrigin } from "@/lib/api/origin";
import requestIp from "@/lib/utils/request-ip";

export const dynamic = "force-dynamic";

const limiter = createLimiter(RATE_LIMITS.passwordResetConfirm);

export const POST = async (request) => {
  if (!sameOrigin(request)) return badOrigin();

  const gate = await limiter.check(`reset-confirm|${requestIp(request)}`);

  if (!gate.ok) return tooManyRequests(gate.resetAt);

  let payload;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Malformed request" }, { status: 400 });
  }

  const parsed = resetConfirmSchema.safeParse(payload);

  if (!parsed.success)
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 422 }
    );

  const { email, code, password } = parsed.data;
  const verified = await verifyCode(email, code);

  if (!verified.ok)
    return Response.json({ error: verified.error }, { status: 422 });

  const updated = await setPasswordByEmail(email, password);

  if (!updated.ok)
    return Response.json({ error: updated.error }, { status: 422 });

  return Response.json({ ok: true });
};
