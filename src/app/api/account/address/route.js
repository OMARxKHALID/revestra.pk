import { accountGuard } from "@/lib/api/account-guard";
import { readBody } from "@/lib/api/request";
import { setAddress } from "@/lib/api/users";
import { savedAddressSchema } from "@/lib/schemas/account";

export const dynamic = "force-dynamic";

export const PUT = async (request) => {
  const { response, userId } = await accountGuard(request);

  if (response) return response;

  const body = await readBody(request, savedAddressSchema, "Invalid address");

  if (body.response) return body.response;

  const saved = await setAddress(userId, body.data);

  if (!saved.ok) return Response.json({ error: saved.error }, { status: 409 });

  return Response.json({ ok: true, address: saved.address });
};
