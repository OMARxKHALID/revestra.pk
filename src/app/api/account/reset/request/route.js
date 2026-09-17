import { findUserByEmail } from "@/lib/api/users";
import { requestReset, CODE_TTL_MINUTES } from "@/lib/api/password-reset";
import { sendPasswordReset } from "@/lib/email";
import { resetRequestSchema } from "@/lib/schemas/account";
import { createLimiter } from "@/lib/rate-limit";
import RATE_LIMITS from "@/lib/rate-limits";
import { guardRequest } from "@/lib/api/request";

export const dynamic = "force-dynamic";

const limiter = createLimiter(RATE_LIMITS.passwordResetRequest);

const accepted = () =>
  Response.json({
    ok: true,
    message:
      "If that address has an account, a six-digit code is on its way. It expires in 15 minutes.",
  });

export const POST = async (request) => {
  const gated = await guardRequest(request, {
    limiter,
    schema: resetRequestSchema,
    prefix: "reset",
    fallback: "Invalid request",
  });

  if (gated.response) return gated.response;

  const { email } = gated.data;
  const perEmail = await limiter.check(`reset|email|${email.toLowerCase()}`);

  if (!perEmail.ok) return accepted();

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
