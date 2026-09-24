import { accountGuard } from "@/lib/api/account-guard";
import { readBody } from "@/lib/api/request";
import { subscribe, unsubscribe } from "@/lib/api/subscribers";
import { getAccount } from "@/lib/api/users";
import { newsletterPreferenceSchema } from "@/lib/schemas/account";

export const dynamic = "force-dynamic";

export const PUT = async (request) => {
  const { response, userId } = await accountGuard(request);

  if (response) return response;

  const email = (await getAccount(userId))?.email;

  if (!email)
    return Response.json({ error: "Your account has no email" }, { status: 409 });

  const body = await readBody(request, newsletterPreferenceSchema, "Invalid request");

  if (body.response) return body.response;

  if (body.data.subscribed) await subscribe(email.toLowerCase());
  else await unsubscribe(email);

  return Response.json({ ok: true, subscribed: body.data.subscribed });
};
