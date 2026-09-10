import { guard, readJson, invalid } from "@/lib/api/admin/guard";
import { listPromos, upsertPromo } from "@/lib/api/admin/promos";
import { adminPromoSchema } from "@/lib/schemas/admin";

export const dynamic = "force-dynamic";

export const GET = async (request) => {
  const { response } = await guard(request);

  if (response) return response;

  return Response.json({ promos: await listPromos() });
};

export const POST = async (request) => {
  const { response } = await guard(request, { mutation: true });

  if (response) return response;

  const body = await readJson(request);

  if (!body.ok) return body.response;

  const parsed = adminPromoSchema.safeParse(body.payload);

  if (!parsed.success) return invalid(parsed.error);

  const saved = await upsertPromo(parsed.data);

  if (!saved.ok) return Response.json({ error: saved.error }, { status: 409 });

  return Response.json({ code: saved.code }, { status: 201 });
};
