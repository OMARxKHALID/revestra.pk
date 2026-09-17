import { accountGuard } from "@/lib/api/account-guard";
import { readBody } from "@/lib/api/request";
import { changePassword } from "@/lib/api/users";
import { passwordSchema } from "@/lib/schemas/account";

export const dynamic = "force-dynamic";

export const PUT = async (request) => {
  const { response, userId } = await accountGuard(request);

  if (response) return response;

  const body = await readBody(request, passwordSchema, "Invalid request");

  if (body.response) return body.response;

  const changed = await changePassword(userId, body.data.current, body.data.next);

  if (!changed.ok)
    return Response.json({ error: changed.error }, { status: 409 });

  return Response.json({ ok: true });
};
