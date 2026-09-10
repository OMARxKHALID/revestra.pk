import { findUserByEmail } from "@/lib/api/users";
import { requestReset, CODE_TTL_MINUTES } from "@/lib/api/password-reset";
import { sendPasswordReset } from "@/lib/email";
import { resetRequestSchema } from "@/lib/schemas/account";
import { createLimiter, tooManyRequests } from "@/lib/rate-limit";
import RATE_LIMITS from "@/lib/rate-limits";
import { sameOrigin, badOrigin } from "@/lib/api/origin";
import requestIp from "@/lib/utils/request-ip";

export const dynamic = "force-dynamic";

const limiter = createLimiter(RATE_LIMITS.passwordResetRequest);

const accepted = () =>
  Response.json({
    ok: true,
    message:
      "If that address has an account, a six-digit code is on its way. It expires in 15 minutes.",
  });

export const POST = async (request) => {
  if (!sameOrigin(request)) return badOrigin();

  const gate = await limiter.check(`reset|${requestIp(request)}`);

  if (!gate.ok) return tooManyRequests(gate.resetAt);

  let payload;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Malformed request" }, { status: 400 });
  }

  const parsed = resetRequestSchema.safeParse(payload);

  if (!parsed.success)
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 422 }
    );

  const { email } = parsed.data;
  const user = await findUserByEmail(email);

  if (!user) return accepted();

  const code = await requestReset(email);

  if (!code) return accepted();

  try {
    await sendPasswordReset(user.email, code, CODE_TTL_MINUTES);
  } catch (error) {
    console.error(`[reset] could not send the code: ${error.message}`);
  }

  return accepted();
};
