import { z } from "zod";
import { guard, readJson, invalid } from "@/lib/api/admin/guard";
import { setCustomerRole } from "@/lib/api/admin/customers";
import { ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

const roleSchema = z.object({ role: z.enum(ROLES) });

export const PATCH = async (request, { params }) => {
  const { response, adminId } = await guard(request, { mutation: true });

  if (response) return response;

  const body = await readJson(request);

  if (!body.ok) return body.response;

  const parsed = roleSchema.safeParse(body.payload);

  if (!parsed.success) return invalid(parsed.error);

  const { id } = await params;
  const result = await setCustomerRole({
    userId: id,
    role: parsed.data.role,
    actingAdminId: adminId,
  });

  if (!result.ok) return Response.json({ error: result.error }, { status: 409 });

  return Response.json({ ok: true, role: result.role });
};
