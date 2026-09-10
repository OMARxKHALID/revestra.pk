import { signUpSchema } from "@/lib/schemas/user";
import { authIsAvailable, createUser } from "@/lib/api/users";
import { getSettings } from "@/lib/api/settings";
import { createLimiter } from "@/lib/rate-limit";
import RATE_LIMITS from "@/lib/rate-limits";
import { gateRequest, readBody } from "@/lib/api/request";

const limiter = createLimiter(RATE_LIMITS.register);

export const POST = async (request) => {
  const gated = await gateRequest(request, limiter);

  if (gated.response) return gated.response;

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

  const body = await readBody(request, signUpSchema, "Invalid details");

  if (body.response) return body.response;

  try {
    const result = await createUser(body.data);

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
