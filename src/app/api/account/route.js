import { accountGuard } from "@/lib/api/account-guard";
import { readBody } from "@/lib/api/request";
import { deleteAccount, getAccount, updateProfile } from "@/lib/api/users";
import { isSubscribed } from "@/lib/api/subscribers";
import { deleteAccountSchema, profileSchema } from "@/lib/schemas/account";

export const dynamic = "force-dynamic";

export const GET = async (request) => {
  const { response, userId } = await accountGuard(request, { mutation: false });

  if (response) return response;

  const account = await getAccount(userId);

  if (!account) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json({
    account: { ...account, subscribed: await isSubscribed(account.email) },
  });
};

export const PATCH = async (request) => {
  const { response, userId } = await accountGuard(request);

  if (response) return response;

  const body = await readBody(request, profileSchema, "Invalid details");

  if (body.response) return body.response;

  const updated = await updateProfile(userId, body.data);

  if (!updated.ok)
    return Response.json({ error: updated.error }, { status: 409 });

  return Response.json({ ok: true, account: updated.user });
};

export const DELETE = async (request) => {
  const { response, userId } = await accountGuard(request);

  if (response) return response;

  const body = await readBody(request, deleteAccountSchema, "Invalid request");

  if (body.response) return body.response;

  const removed = await deleteAccount(userId, body.data.password);

  if (!removed.ok)
    return Response.json({ error: removed.error }, { status: 409 });

  return Response.json({ ok: true });
};
