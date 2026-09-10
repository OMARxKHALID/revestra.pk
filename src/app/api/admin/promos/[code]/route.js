import { guard } from "@/lib/api/admin/guard";
import { deletePromo } from "@/lib/api/admin/promos";

export const dynamic = "force-dynamic";

export const DELETE = async (request, { params }) => {
  const { response } = await guard(request, { mutation: true });

  if (response) return response;

  const { code } = await params;
  const removed = await deletePromo(code.toUpperCase());

  if (!removed.ok)
    return Response.json({ error: removed.error }, { status: 404 });

  return Response.json({ ok: true });
};
