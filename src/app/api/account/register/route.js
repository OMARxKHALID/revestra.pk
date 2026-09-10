import { signUpSchema } from "@/lib/schemas/user";
import { authIsAvailable, createUser } from "@/lib/api/users";
import { getSettings } from "@/lib/api/settings";
import { createLimiter, tooManyRequests } from "@/lib/rate-limit";
import RATE_LIMITS from "@/lib/rate-limits";
import requestIp from "@/lib/utils/request-ip";
import { sameOrigin, badOrigin } from "@/lib/api/origin";

const limiter = createLimiter(RATE_LIMITS.register);

export const POST = async (request) => {
  if (!sameOrigin(request)) return badOrigin();

  const gate = await limiter.check(requestIp(request));

  if (!gate.ok) return tooManyRequests(gate.resetAt);

  if (!authIsAvailable())
    return Response.json(
      { error: "Accounts need a database. This deployment has none." },
      { status: 503 }
    );

  const { signupOpen } = await getSettings();

  if (!signupOpen)
    return Response.json(
      { error: "New accounts are closed at the moment" },
      { status: 403 }
    );

  let payload;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Malformed request" }, { status: 400 });
  }

  const parsed = signUpSchema.safeParse(payload);

  if (!parsed.success)
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid details" },
      { status: 422 }
    );

  try {
    const result = await createUser(parsed.data);

    if (!result.ok)
      return Response.json(
        { error: "An account with that email already exists" },
        { status: 409 }
      );

    return Response.json({ user: result.user }, { status: 201 });
  } catch (error) {
    console.error(`[register] could not create the account: ${error.message}`);

    return Response.json(
      { error: "We could not create your account. Try again shortly." },
      { status: 503 }
    );
  }
};
