import { signUpSchema } from "@/lib/schemas/user";
import { authIsAvailable, createUser } from "@/lib/api/users";
import { createRateLimiter, tooManyRequests } from "@/lib/rate-limit";
import requestIp from "@/lib/utils/request-ip";

const limiter = createRateLimiter({ limit: 5, windowMs: 60 * 60 * 1000 });

export const POST = async (request) => {
  const gate = limiter.check(requestIp(request));

  if (!gate.ok) return tooManyRequests(gate.resetAt);

  if (!authIsAvailable())
    return Response.json(
      { error: "Accounts need a database. This deployment has none." },
      { status: 503 }
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
