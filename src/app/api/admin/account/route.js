import { guard, readJson, invalid } from "@/lib/api/admin/guard";
import { changePassword, findUserById, updateProfile } from "@/lib/api/users";
import { ROLE } from "@/lib/roles";
import { passwordSchema, profileSchema } from "@/lib/schemas/account";

export const dynamic = "force-dynamic";

export const GET = async (request) => {
  const { response, adminId } = await guard(request);

  if (response) return response;

  const user = await findUserById(adminId);

  if (!user) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json({
    account: { name: user.name, email: user.email, role: user.role ?? ROLE.admin },
  });
};

export const PATCH = async (request) => {
  const { response, adminId } = await guard(request, { mutation: true });

  if (response) return response;

  const body = await readJson(request);

  if (!body.ok) return body.response;

  if (body.payload.current !== undefined) {
    const parsed = passwordSchema.safeParse(body.payload);

    if (!parsed.success) return invalid(parsed.error);

    const changed = await changePassword(
      adminId,
      parsed.data.current,
      parsed.data.next
    );

    if (!changed.ok)
      return Response.json({ error: changed.error }, { status: 422 });

    return Response.json({ ok: true, changed: "password" });
  }

  const parsed = profileSchema.safeParse(body.payload);

  if (!parsed.success) return invalid(parsed.error);

  const updated = await updateProfile(adminId, parsed.data);

  if (!updated.ok)
    return Response.json({ error: updated.error }, { status: 409 });

  return Response.json({ ok: true, account: updated.user });
};
