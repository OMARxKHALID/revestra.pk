import { setPasswordByEmail } from "@/lib/api/users";
import { verifyCode } from "@/lib/api/password-reset";
import { resetConfirmSchema } from "@/lib/schemas/account";
import { createLimiter } from "@/lib/rate-limit";
import RATE_LIMITS from "@/lib/rate-limits";
import { guardRequest } from "@/lib/api/request";

export const dynamic = "force-dynamic";

const limiter = createLimiter(RATE_LIMITS.passwordResetConfirm);

export const POST = async (request) => {
  const gated = await guardRequest(request, {
    limiter,
    schema: resetConfirmSchema,
    prefix: "reset-confirm",
    fallback: "Invalid request",
  });

  if (gated.response) return gated.response;

  const { email, code, password } = gated.data;
  const verified = await verifyCode(email, code);

  if (!verified.ok)
    return Response.json({ error: verified.error }, { status: 422 });

  const updated = await setPasswordByEmail(email, password);

  if (!updated.ok)
    return Response.json({ error: updated.error }, { status: 422 });

  return Response.json({ ok: true });
};
